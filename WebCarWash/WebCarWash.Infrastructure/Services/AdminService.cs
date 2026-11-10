using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Admin;
using WebCarWash.Application.Interfaces;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Data;

namespace WebCarWash.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly CarWashDbContext _context;

        public AdminService(CarWashDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Technician)
                .Include(b => b.Vehicle)
                .Include(b => b.ServicePackage)
                .Include(b => b.BookingAddOns)
                    .ThenInclude(ba => ba.AddOn)
                .Include(b => b.PhotoQAs)
                .OrderByDescending(b => b.ScheduledAt)
                .ToListAsync();

            var completed = bookings.Where(b => b.Status == BookingStatus.COMPLETED).ToList();
            var totalRevenue = completed.Sum(b => b.TotalPrice);
            var techTotal = completed.Sum(b => (float)Math.Round(b.TotalPrice * 0.7f, MidpointRounding.AwayFromZero));
            var platformCommission = MathF.Max(0f, totalRevenue - techTotal);

            var activeStatuses = new[]
            {
                BookingStatus.PENDING,
                BookingStatus.DEPOSIT_PAID,
                BookingStatus.DISPATCHED,
                BookingStatus.ON_THE_WAY,
                BookingStatus.ARRIVED,
                BookingStatus.WASHING
            };

            var totalCustomers = await _context.Customers.CountAsync();
            var technicians = await _context.Technicians.ToListAsync();
            var openDisputes = await _context.Disputes.CountAsync(d => d.Status == DisputeStatus.OPEN || d.Status == DisputeStatus.UNDER_REVIEW);
            var pendingPayouts = await _context.Payouts.Where(p => p.Status == "Pending").ToListAsync();
            var pendingApps = await _context.TechnicianApplications.CountAsync(a => a.Status == "Pending Review");

            var statusBreakdown = bookings
                .GroupBy(b => b.Status.ToString())
                .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
                .OrderByDescending(s => s.Count)
                .ToList();

            var revenueByPackage = completed
                .GroupBy(b => b.ServicePackage?.Name ?? "Car Wash")
                .Select(g => new PackageRevenueDto
                {
                    PackageName = g.Key,
                    BookingsCount = g.Count(),
                    Revenue = g.Sum(b => b.TotalPrice)
                })
                .OrderByDescending(p => p.Revenue)
                .ToList();

            return new AdminDashboardDto
            {
                TotalRevenue = totalRevenue,
                PlatformCommission = platformCommission,
                TechnicianPayoutsTotal = techTotal,
                TotalBookings = bookings.Count,
                ActiveBookings = bookings.Count(b => activeStatuses.Contains(b.Status)),
                CompletedBookings = completed.Count,
                CancelledBookings = bookings.Count(b => b.Status == BookingStatus.CANCELLED),
                TotalCustomers = totalCustomers,
                TotalTechnicians = technicians.Count,
                OnlineTechnicians = technicians.Count(t => t.IsOnline),
                OpenDisputes = openDisputes,
                PendingPayoutsCount = pendingPayouts.Count,
                PendingPayoutsAmount = pendingPayouts.Sum(p => p.Amount),
                PendingApplicationsCount = pendingApps,
                StatusBreakdown = statusBreakdown,
                RevenueByPackage = revenueByPackage,
                RecentBookings = bookings.Take(8).Select(MapBookingDto).ToList()
            };
        }

        public async Task<IEnumerable<AdminBookingDto>> GetBookingsAsync(string? status = null, string? search = null)
        {
            var query = _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Technician)
                .Include(b => b.Vehicle)
                .Include(b => b.ServicePackage)
                .Include(b => b.BookingAddOns)
                    .ThenInclude(ba => ba.AddOn)
                .Include(b => b.PhotoQAs)
                .OrderByDescending(b => b.ScheduledAt)
                .AsQueryable();

            var list = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                list = list.Where(b => b.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                list = list.Where(b =>
                    b.BookingNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    (b.Customer?.FullName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (b.Technician?.FullName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    b.Address.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            return list.Select(MapBookingDto);
        }

        public async Task<bool> AssignTechnicianAsync(Guid bookingId, Guid technicianId)
        {
            var booking = await _context.Bookings
                .Include(b => b.ServicePackage)
                .Include(b => b.JobOffers)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (booking == null || tech == null) return false;

            booking.TechnicianId = tech.Id;
            if (booking.Status is BookingStatus.PENDING or BookingStatus.DEPOSIT_PAID)
            {
                booking.Status = BookingStatus.DISPATCHED;
                booking.AcceptedAt = DateTime.UtcNow;
            }

            foreach (var offer in booking.JobOffers.Where(o => o.Status == JobOfferStatus.OFFERED))
            {
                offer.Expire();
            }

            _context.Notifications.Add(new Notification
            {
                UserId = tech.Id,
                Title = "Admin Assigned Booking",
                Description = $"Admin assigned booking {booking.BookingNumber} ({booking.ServicePackage?.Name ?? "Car Wash"}) to you.",
                Type = "BriefcaseBusiness",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null || !Enum.TryParse<BookingStatus>(status, true, out var parsed))
            {
                return false;
            }

            if (parsed == BookingStatus.COMPLETED && booking.Status != BookingStatus.COMPLETED && booking.TechnicianId.HasValue)
            {
                var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == booking.TechnicianId.Value);
                if (tech != null)
                {
                    tech.MarkCompleted(booking);
                }
                else
                {
                    booking.Status = parsed;
                }
            }
            else
            {
                booking.Status = parsed;
                if (parsed == BookingStatus.DISPATCHED && !booking.AcceptedAt.HasValue)
                {
                    booking.AcceptedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AdminTechnicianDto>> GetTechniciansAsync()
        {
            var techs = await _context.Technicians
                .Include(t => t.Bookings)
                .Include(t => t.TechnicianApplication)
                .ToListAsync();

            return techs.Select(t => new AdminTechnicianDto
            {
                Id = t.Id,
                FullName = t.FullName,
                Email = t.Email,
                Phone = t.Phone,
                ServiceArea = string.IsNullOrWhiteSpace(t.ServiceArea) ? "Cairo" : t.ServiceArea,
                IsOnline = t.IsOnline,
                Rating = t.Rating,
                AcceptanceRate = t.AcceptanceRate,
                TodayEarnings = t.TodayEarnings,
                TotalBalance = t.TotalBalance,
                CompletedJobsCount = t.Bookings.Count(b => b.Status == BookingStatus.COMPLETED),
                ActiveJobsCount = t.Bookings.Count(b => b.Status != BookingStatus.COMPLETED && b.Status != BookingStatus.CANCELLED),
                ApplicationStatus = t.TechnicianApplication?.Status ?? "Approved",
                HasPressureWasher = t.TechnicianApplication?.HasPressureWasher ?? true,
                HasVacuumExtractor = t.TechnicianApplication?.HasVacuumExtractor ?? true,
                HasWaterTankGenerator = t.TechnicianApplication?.HasWaterTankGenerator ?? true,
                HasVehicle = t.TechnicianApplication?.HasVehicle ?? true
            });
        }

        public async Task<bool> ToggleTechnicianAvailabilityAsync(Guid technicianId, bool isOnline)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech == null) return false;
            tech.ToggleAvailability(isOnline);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReviewTechnicianApplicationAsync(Guid technicianId, string decision)
        {
            var tech = await _context.Technicians
                .Include(t => t.TechnicianApplication)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech == null) return false;

            if (tech.TechnicianApplication == null)
            {
                tech.TechnicianApplication = new TechnicianApplication
                {
                    TechnicianId = tech.Id,
                    HasPressureWasher = true,
                    HasVacuumExtractor = true,
                    HasWaterTankGenerator = true,
                    HasVehicle = true,
                    Status = decision
                };
                _context.TechnicianApplications.Add(tech.TechnicianApplication);
            }
            else
            {
                tech.TechnicianApplication.ReviewApplication(decision);
            }

            if (decision.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
            {
                tech.IsOnline = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AdminCustomerDto>> GetCustomersAsync()
        {
            var customers = await _context.Customers
                .Include(c => c.Vehicles)
                .Include(c => c.Bookings)
                .ToListAsync();

            return customers.Select(c => new AdminCustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Email = c.Email,
                Phone = c.Phone,
                WalletBalance = c.WalletBalance,
                LoyaltyPoints = c.LoyaltyPoints,
                VehiclesCount = c.Vehicles.Count,
                BookingsCount = c.Bookings.Count,
                TotalSpent = c.Bookings.Where(b => b.Status != BookingStatus.CANCELLED).Sum(b => b.TotalPrice),
                SavedAddresses = c.SavedAddresses ?? new List<string>()
            });
        }

        public async Task<AdminCatalogDto> GetCatalogAsync()
        {
            var packages = await _context.ServicePackages.OrderBy(p => p.BasePrice).ToListAsync();
            var addOns = await _context.AddOns.OrderByDescending(a => a.Price).ToListAsync();
            var zones = await _context.ServiceZones
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .ToListAsync();

            return new AdminCatalogDto
            {
                Packages = packages.Select(p => new AdminServicePackageDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    BasePrice = p.BasePrice,
                    DurationMinutes = p.DurationMinutes,
                    RequiresElectricity = p.RequiresElectricity,
                    RequiresWater = p.RequiresWater,
                    RequiresPrivateParking = p.RequiresPrivateParking
                }).ToList(),
                AddOns = addOns.Select(a => new AdminAddOnDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Price = a.Price,
                    Description = a.Description,
                    IsActive = a.IsActive
                }).ToList(),
                Zones = zones.Select(MapZoneDto).ToList()
            };
        }

        public async Task<AdminServicePackageDto?> UpdateServicePackageAsync(Guid packageId, UpdateServicePackageDto dto)
        {
            var pkg = await _context.ServicePackages.FirstOrDefaultAsync(p => p.Id == packageId);
            if (pkg == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) pkg.Name = dto.Name.Trim();
            if (dto.BasePrice > 0) pkg.BasePrice = dto.BasePrice;
            if (dto.DurationMinutes > 0) pkg.DurationMinutes = dto.DurationMinutes;
            pkg.RequiresElectricity = dto.RequiresElectricity;
            pkg.RequiresWater = dto.RequiresWater;
            pkg.RequiresPrivateParking = dto.RequiresPrivateParking;

            await _context.SaveChangesAsync();

            return new AdminServicePackageDto
            {
                Id = pkg.Id,
                Name = pkg.Name,
                BasePrice = pkg.BasePrice,
                DurationMinutes = pkg.DurationMinutes,
                RequiresElectricity = pkg.RequiresElectricity,
                RequiresWater = pkg.RequiresWater,
                RequiresPrivateParking = pkg.RequiresPrivateParking
            };
        }

        public async Task<AdminAddOnDto?> UpdateAddOnAsync(Guid addOnId, UpdateAddOnDto dto)
        {
            var addon = await _context.AddOns.FirstOrDefaultAsync(a => a.Id == addOnId);
            if (addon == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) addon.Name = dto.Name.Trim();
            if (dto.Price >= 0) addon.Price = dto.Price;
            if (dto.Description != null) addon.Description = dto.Description.Trim();
            addon.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return new AdminAddOnDto
            {
                Id = addon.Id,
                Name = addon.Name,
                Price = addon.Price,
                Description = addon.Description,
                IsActive = addon.IsActive
            };
        }

        public async Task<IEnumerable<AdminServiceZoneDto>> GetServiceZonesAsync()
        {
            var zones = await _context.ServiceZones
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .ToListAsync();

            return zones.Select(MapZoneDto);
        }

        public async Task<AdminServiceZoneDto> CreateServiceZoneAsync(UpsertServiceZoneDto dto)
        {
            var zone = new ServiceZone
            {
                ZoneName = dto.ZoneName.Trim(),
                Status = dto.Status,
                BaseDistanceSurcharge = dto.BaseDistanceSurcharge,
                PeakSurgeMultiplier = dto.PeakSurgeMultiplier > 0 ? dto.PeakSurgeMultiplier : 1.0f,
                MaxTechnicians = dto.MaxTechnicians > 0 ? dto.MaxTechnicians : 10,
                PolygonBoundary = new List<Point> { new(30.05f, 31.34f), new(30.08f, 31.32f), new(30.02f, 31.49f) }
            };

            _context.ServiceZones.Add(zone);
            await _context.SaveChangesAsync();
            return MapZoneDto(zone);
        }

        public async Task<AdminServiceZoneDto?> UpdateServiceZoneAsync(Guid zoneId, UpsertServiceZoneDto dto)
        {
            var zone = await _context.ServiceZones
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .FirstOrDefaultAsync(z => z.Id == zoneId);

            if (zone == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.ZoneName)) zone.ZoneName = dto.ZoneName.Trim();
            zone.Status = dto.Status;
            zone.BaseDistanceSurcharge = dto.BaseDistanceSurcharge;
            zone.PeakSurgeMultiplier = dto.PeakSurgeMultiplier > 0 ? dto.PeakSurgeMultiplier : 1.0f;
            zone.MaxTechnicians = dto.MaxTechnicians > 0 ? dto.MaxTechnicians : 10;

            await _context.SaveChangesAsync();
            return MapZoneDto(zone);
        }

        public async Task<IEnumerable<AdminDisputeDto>> GetDisputesAsync()
        {
            var disputes = await _context.Disputes
                .Include(d => d.Customer)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.Technician)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.Vehicle)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.PhotoQAs)
                .OrderByDescending(d => d.FiledAt)
                .ToListAsync();

            return disputes.Select(MapDisputeDto);
        }

        public async Task<AdminDisputeDto?> ResolveDisputeAsync(Guid disputeId, ResolveDisputeDto dto)
        {
            var dispute = await _context.Disputes
                .Include(d => d.Customer)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.Technician)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.Vehicle)
                .Include(d => d.Booking)
                    .ThenInclude(b => b.PhotoQAs)
                .FirstOrDefaultAsync(d => d.Id == disputeId);

            if (dispute == null) return null;

            var action = dto.Action.ToUpperInvariant();
            switch (action)
            {
                case "REFUNDED":
                    var wasAlreadyRefunded = dispute.Status == DisputeStatus.REFUNDED;
                    dispute.IssueRefund();
                    if (!wasAlreadyRefunded && dispute.Customer != null && dispute.Booking != null)
                    {
                        dispute.Customer.WalletBalance += dispute.Booking.TotalPrice;
                    }
                    break;
                case "REWASH_DISPATCHED":
                    var wasAlreadyRewash = dispute.Status == DisputeStatus.REWASH_DISPATCHED;
                    dispute.DispatchRewash();
                    if (!wasAlreadyRewash && dispute.Booking != null)
                    {
                        var orig = dispute.Booking;
                        var rwNumber = $"#BK-RW{Random.Shared.Next(100, 999)}";
                        while (await _context.Bookings.AnyAsync(b => b.BookingNumber == rwNumber))
                        {
                            rwNumber = $"#BK-RW{Random.Shared.Next(100, 999)}";
                        }

                        var rewashBooking = new Booking
                        {
                            BookingNumber = rwNumber,
                            CustomerId = orig.CustomerId,
                            ServicePackageId = orig.ServicePackageId,
                            VehicleId = orig.VehicleId,
                            ServiceZoneId = orig.ServiceZoneId,
                            ScheduledAt = DateTime.UtcNow.AddHours(2),
                            BookingType = BookingType.FAST_TRACK,
                            ParkingType = orig.ParkingType,
                            HasElectricity = orig.HasElectricity,
                            HasWaterAccess = orig.HasWaterAccess,
                            Address = orig.Address,
                            ParkingLatitude = orig.ParkingLatitude,
                            ParkingLongitude = orig.ParkingLongitude,
                            BasePackagePrice = 0f,
                            VehicleMultiplier = 1.0f,
                            AddOnsSubtotal = 0f,
                            DistanceSurcharge = 0f,
                            PeakSurgeMultiplier = 1.0f,
                            TotalPrice = 0f,
                            DepositAmount = 0f,
                            RemainingBalance = 0f,
                            Status = BookingStatus.DEPOSIT_PAID
                        };
                        _context.Bookings.Add(rewashBooking);

                        var tech = await _context.Technicians.Where(t => t.IsOnline).FirstOrDefaultAsync()
                            ?? await _context.Technicians.FirstOrDefaultAsync();
                        if (tech != null)
                        {
                            _context.JobOffers.Add(new JobOffer
                            {
                                BookingId = rewashBooking.Id,
                                TechnicianId = tech.Id,
                                Status = JobOfferStatus.OFFERED,
                                PayoutAmount = 0f,
                                OfferedAt = DateTime.UtcNow,
                                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                            });

                            _context.Notifications.Add(new Notification
                            {
                                UserId = tech.Id,
                                Title = "Free Re-Wash Dispatch",
                                Description = $"Admin dispatched free re-wash {rwNumber} for dispute on {orig.BookingNumber}.",
                                Type = "AlertCircle",
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                    break;
                case "REJECTED":
                    dispute.RejectDispute(dto.AdminNotes ?? "Rejected after PhotoQA review.");
                    break;
                default:
                    dispute.Status = DisputeStatus.UNDER_REVIEW;
                    break;
            }

            if (!string.IsNullOrWhiteSpace(dto.AdminNotes))
            {
                dispute.AdminNotes = dto.AdminNotes.Trim();
            }

            await _context.SaveChangesAsync();
            return MapDisputeDto(dispute);
        }

        public async Task<IEnumerable<AdminPayoutDto>> GetPayoutsAsync()
        {
            var payouts = await _context.Payouts
                .Include(p => p.Technician)
                .OrderByDescending(p => p.RequestedAt)
                .ToListAsync();

            return payouts.Select(MapPayoutDto);
        }

        public async Task<AdminPayoutDto?> ProcessPayoutAsync(Guid payoutId, bool approve)
        {
            var payout = await _context.Payouts
                .Include(p => p.Technician)
                .FirstOrDefaultAsync(p => p.Id == payoutId);

            if (payout == null) return null;

            if (payout.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            {
                if (approve)
                {
                    payout.ApproveTransfer();
                    if (payout.Technician != null)
                    {
                        _context.Notifications.Add(new Notification
                        {
                            UserId = payout.TechnicianId,
                            Title = "Payout Processed",
                            Description = $"Your payout request of EGP {payout.Amount} via {payout.PayoutMethod} has been approved.",
                            Type = "Wallet",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                else
                {
                    payout.CancelPayout();
                    if (payout.Technician != null)
                    {
                        payout.Technician.TotalBalance += payout.Amount;
                        _context.Notifications.Add(new Notification
                        {
                            UserId = payout.TechnicianId,
                            Title = "Payout Cancelled",
                            Description = $"Your payout request of EGP {payout.Amount} was cancelled and returned to your balance.",
                            Type = "AlertCircle",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                await _context.SaveChangesAsync();
            }

            return MapPayoutDto(payout);
        }

        private static AdminBookingDto MapBookingDto(Booking b)
        {
            var travelStart = b.OnTheWayAt ?? b.AcceptedAt;
            int? travelMinutes = (travelStart.HasValue && b.ArrivedAt.HasValue)
                ? Math.Max(1, (int)Math.Round((b.ArrivedAt.Value - travelStart.Value).TotalMinutes))
                : null;

            int? workMinutes = (b.WashingStartedAt.HasValue && b.CompletedAt.HasValue)
                ? Math.Max(1, (int)Math.Round((b.CompletedAt.Value - b.WashingStartedAt.Value).TotalMinutes))
                : null;

            var tripStart = b.OnTheWayAt ?? b.AcceptedAt ?? b.WashingStartedAt;
            int? totalTripMinutes = (tripStart.HasValue && b.CompletedAt.HasValue)
                ? Math.Max(1, (int)Math.Round((b.CompletedAt.Value - tripStart.Value).TotalMinutes))
                : null;

            return new AdminBookingDto
            {
                Id = b.Id,
                BookingNumber = b.BookingNumber,
                Status = b.Status.ToString(),
                BookingType = b.BookingType.ToString(),
                ScheduledAt = b.ScheduledAt,
                Address = b.Address,
                CustomerId = b.CustomerId,
                CustomerName = b.Customer?.FullName ?? "Customer",
                CustomerPhone = b.Customer?.Phone ?? "",
                TechnicianId = b.TechnicianId,
                TechnicianName = b.Technician?.FullName,
                ServiceName = b.ServicePackage?.Name ?? "Car Wash",
                VehicleName = b.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model}" : "Sedan",
                LicensePlate = b.Vehicle?.LicensePlate ?? "",
                BasePackagePrice = b.BasePackagePrice > 0 ? b.BasePackagePrice : (b.ServicePackage?.BasePrice ?? b.TotalPrice),
                VehicleMultiplier = b.VehicleMultiplier > 0 ? b.VehicleMultiplier : 1.0f,
                AddOnsSubtotal = b.AddOnsSubtotal,
                DistanceSurcharge = b.DistanceSurcharge,
                UpsellTotal = b.UpsellTotal,
                TotalPrice = b.TotalPrice,
                DepositAmount = b.DepositAmount,
                RemainingBalance = MathF.Max(0f, b.TotalPrice - b.DepositAmount),
                AddOnNames = b.BookingAddOns?.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() ?? new List<string>(),
                CancelledBy = b.CancelledBy,
                AcceptedAt = b.AcceptedAt,
                OnTheWayAt = b.OnTheWayAt,
                ArrivedAt = b.ArrivedAt,
                WashingStartedAt = b.WashingStartedAt,
                CompletedAt = b.CompletedAt,
                TravelDurationMinutes = travelMinutes,
                WorkDurationMinutes = workMinutes,
                TotalTripMinutes = totalTripMinutes,
                ParkingLatitude = b.ParkingLatitude,
                ParkingLongitude = b.ParkingLongitude,
                DistanceText = b.DistanceText,
                Photos = b.PhotoQAs?
                    .OrderBy(p => p.Timestamp)
                    .Select(p => new AdminBookingPhotoDto
                    {
                        Id = p.Id,
                        PhotoType = p.PhotoType.ToString(),
                        Category = p.Category.ToString(),
                        ImageUrl = p.ImageUrl,
                        Timestamp = p.Timestamp,
                        GpsLatitude = p.GpsLatitude,
                        GpsLongitude = p.GpsLongitude
                    }).ToList() ?? new List<AdminBookingPhotoDto>()
            };
        }

        private static AdminServiceZoneDto MapZoneDto(ServiceZone z) => new()
        {
            Id = z.Id,
            ZoneName = z.ZoneName,
            Status = z.Status.ToString(),
            BaseDistanceSurcharge = z.BaseDistanceSurcharge,
            PeakSurgeMultiplier = z.PeakSurgeMultiplier,
            MaxTechnicians = z.MaxTechnicians,
            BookingsCount = z.Bookings?.Count ?? 0,
            TechniciansCount = z.Technicians?.Count ?? 0
        };

        private static AdminDisputeDto MapDisputeDto(Dispute d)
        {
            var b = d.Booking;
            var expectedMins = Math.Max(30, b?.ServicePackage?.DurationMinutes ?? 45);
            var travelStart = b?.OnTheWayAt ?? b?.AcceptedAt;
            int? travelMinutes = (travelStart.HasValue && b?.ArrivedAt.HasValue == true)
                ? Math.Max(1, (int)Math.Round((b.ArrivedAt.Value - travelStart.Value).TotalMinutes))
                : null;
            int? workMinutes = (b?.WashingStartedAt.HasValue == true && b.CompletedAt.HasValue)
                ? Math.Max(1, (int)Math.Round((b.CompletedAt.Value - b.WashingStartedAt.Value).TotalMinutes))
                : null;

            bool isDelayed = false;
            int delayMinutes = 0;
            string delaySummary = "On time (Arrived before or at scheduled time)";

            if (b != null)
            {
                var arrivalRef = b.ArrivedAt ?? b.WashingStartedAt;
                if (arrivalRef.HasValue && arrivalRef.Value > b.ScheduledAt.AddMinutes(5))
                {
                    isDelayed = true;
                    delayMinutes = (int)Math.Round((arrivalRef.Value - b.ScheduledAt).TotalMinutes);
                    delaySummary = $"Arrived {delayMinutes} mins late vs scheduled time";
                }
                else if (workMinutes.HasValue && workMinutes.Value > expectedMins + 15)
                {
                    isDelayed = true;
                    delayMinutes = workMinutes.Value - expectedMins;
                    delaySummary = $"Service exceeded expected time by {delayMinutes} mins";
                }
                else if (!arrivalRef.HasValue)
                {
                    delaySummary = "Timing data unavailable";
                }
            }

            return new AdminDisputeDto
            {
                Id = d.Id,
                BookingId = d.BookingId,
                BookingNumber = b?.BookingNumber ?? "#BK-0000",
                BookingStatus = b?.Status.ToString() ?? "UNKNOWN",
                CustomerName = d.Customer?.FullName ?? "Customer",
                CustomerPhone = d.Customer?.Phone ?? "",
                TechnicianName = b?.Technician?.FullName,
                ServiceName = b?.ServicePackage?.Name ?? "Car Wash",
                VehicleName = b?.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model}" : "Vehicle",
                Address = b?.Address ?? "",
                TotalPrice = b?.TotalPrice ?? 0f,
                Reason = d.Reason,
                Status = d.Status.ToString(),
                AdminNotes = d.AdminNotes,
                FiledAt = d.FiledAt,
                ResolvedAt = d.ResolvedAt,
                PhotoQACount = b?.PhotoQAs?.Count ?? 0,
                ScheduledAt = b?.ScheduledAt,
                AcceptedAt = b?.AcceptedAt,
                OnTheWayAt = b?.OnTheWayAt,
                ArrivedAt = b?.ArrivedAt,
                WashingStartedAt = b?.WashingStartedAt,
                CompletedAt = b?.CompletedAt,
                TravelDurationMinutes = travelMinutes,
                WorkDurationMinutes = workMinutes,
                ExpectedDurationMinutes = expectedMins,
                IsDelayed = isDelayed,
                DelayMinutes = delayMinutes,
                DelaySummary = delaySummary,
                EvidenceUrls = d.EvidenceUrls ?? new List<string>(),
                Photos = b?.PhotoQAs?
                    .OrderBy(p => p.Timestamp)
                    .Select(p => new AdminBookingPhotoDto
                    {
                        Id = p.Id,
                        PhotoType = p.PhotoType.ToString(),
                        Category = p.Category.ToString(),
                        ImageUrl = p.ImageUrl,
                        Timestamp = p.Timestamp,
                        GpsLatitude = p.GpsLatitude,
                        GpsLongitude = p.GpsLongitude
                    }).ToList() ?? new List<AdminBookingPhotoDto>()
            };
        }

        private static AdminPayoutDto MapPayoutDto(Payout p) => new()
        {
            Id = p.Id,
            TechnicianId = p.TechnicianId,
            TechnicianName = p.Technician?.FullName ?? "Technician",
            Amount = p.Amount,
            PayoutMethod = p.PayoutMethod,
            AccountDetails = p.AccountDetails,
            Status = p.Status,
            RequestedAt = p.RequestedAt,
            ProcessedAt = p.ProcessedAt
        };
    }
}
