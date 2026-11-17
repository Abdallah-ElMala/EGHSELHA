using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Admin;
using WebCarWash.Application.Interfaces;
using WebCarWash.Application.Interfaces.Repositories;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            var bookings = await _unitOfWork.Bookings.Query()
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

            var totalCustomers = await _unitOfWork.Customers.Query().CountAsync();
            var technicians = await _unitOfWork.Technicians.Query().ToListAsync();
            var openDisputes = await _unitOfWork.Disputes.Query()
                .CountAsync(d => d.Status == DisputeStatus.OPEN || d.Status == DisputeStatus.UNDER_REVIEW);
            var pendingPayouts = await _unitOfWork.Payouts.Query()
                .Where(p => p.Status == "Pending")
                .ToListAsync();
            var pendingApps = await _unitOfWork.TechnicianApplications.Query()
                .CountAsync(a => a.Status == "Pending Review");

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

            var recentBookings = _mapper.Map<List<AdminBookingDto>>(bookings.Take(8).ToList());
            EnrichBookingsTiming(bookings.Take(8).ToList(), recentBookings);

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
                RecentBookings = recentBookings
            };
        }

        public async Task<IEnumerable<AdminBookingDto>> GetBookingsAsync(string? status = null, string? search = null)
        {
            var query = _unitOfWork.Bookings.Query()
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

            var dtos = _mapper.Map<List<AdminBookingDto>>(list);
            EnrichBookingsTiming(list, dtos);
            return dtos;
        }

        public async Task<bool> AssignTechnicianAsync(Guid bookingId, Guid technicianId)
        {
            var booking = await _unitOfWork.Bookings.Query()
                .Include(b => b.ServicePackage)
                .Include(b => b.JobOffers)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            var tech = await _unitOfWork.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
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

            await _unitOfWork.Notifications.AddAsync(new Notification
            {
                UserId = tech.Id,
                Title = "Admin Assigned Booking",
                Description = $"Admin assigned booking {booking.BookingNumber} ({booking.ServicePackage?.Name ?? "Car Wash"}) to you.",
                Type = "BriefcaseBusiness",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var booking = await _unitOfWork.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null || !Enum.TryParse<BookingStatus>(status, true, out var parsed))
            {
                return false;
            }

            if (parsed == BookingStatus.COMPLETED && booking.Status != BookingStatus.COMPLETED && booking.TechnicianId.HasValue)
            {
                var tech = await _unitOfWork.Technicians.FirstOrDefaultAsync(t => t.Id == booking.TechnicianId.Value);
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

            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<AdminTechnicianDto>> GetTechniciansAsync()
        {
            var techs = await _unitOfWork.Technicians.Query()
                .Include(t => t.Bookings)
                .Include(t => t.TechnicianApplication)
                .ToListAsync();

            return _mapper.Map<List<AdminTechnicianDto>>(techs);
        }

        public async Task<bool> ToggleTechnicianAvailabilityAsync(Guid technicianId, bool isOnline)
        {
            var tech = await _unitOfWork.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech == null) return false;
            tech.ToggleAvailability(isOnline);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> ReviewTechnicianApplicationAsync(Guid technicianId, string decision)
        {
            var tech = await _unitOfWork.Technicians.Query()
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
                await _unitOfWork.TechnicianApplications.AddAsync(tech.TechnicianApplication);
            }
            else
            {
                tech.TechnicianApplication.ReviewApplication(decision);
            }

            if (decision.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
            {
                tech.IsOnline = false;
            }

            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<AdminCustomerDto>> GetCustomersAsync()
        {
            var customers = await _unitOfWork.Customers.Query()
                .Include(c => c.Vehicles)
                .Include(c => c.Bookings)
                .ToListAsync();

            return _mapper.Map<List<AdminCustomerDto>>(customers);
        }

        public async Task<AdminCatalogDto> GetCatalogAsync()
        {
            var packages = await _unitOfWork.ServicePackages.Query()
                .OrderBy(p => p.BasePrice)
                .ToListAsync();
            var addOns = await _unitOfWork.AddOns.Query()
                .OrderByDescending(a => a.Price)
                .ToListAsync();
            var zones = await _unitOfWork.ServiceZones.Query()
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .ToListAsync();

            return new AdminCatalogDto
            {
                Packages = _mapper.Map<List<AdminServicePackageDto>>(packages),
                AddOns = _mapper.Map<List<AdminAddOnDto>>(addOns),
                Zones = _mapper.Map<List<AdminServiceZoneDto>>(zones)
            };
        }

        public async Task<AdminServicePackageDto?> UpdateServicePackageAsync(Guid packageId, UpdateServicePackageDto dto)
        {
            var pkg = await _unitOfWork.ServicePackages.FirstOrDefaultAsync(p => p.Id == packageId);
            if (pkg == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) pkg.Name = dto.Name.Trim();
            if (dto.BasePrice > 0) pkg.BasePrice = dto.BasePrice;
            if (dto.DurationMinutes > 0) pkg.DurationMinutes = dto.DurationMinutes;
            pkg.RequiresElectricity = dto.RequiresElectricity;
            pkg.RequiresWater = dto.RequiresWater;
            pkg.RequiresPrivateParking = dto.RequiresPrivateParking;

            await _unitOfWork.CompleteAsync();
            return _mapper.Map<AdminServicePackageDto>(pkg);
        }

        public async Task<AdminAddOnDto?> UpdateAddOnAsync(Guid addOnId, UpdateAddOnDto dto)
        {
            var addon = await _unitOfWork.AddOns.FirstOrDefaultAsync(a => a.Id == addOnId);
            if (addon == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Name)) addon.Name = dto.Name.Trim();
            if (dto.Price >= 0) addon.Price = dto.Price;
            if (dto.Description != null) addon.Description = dto.Description.Trim();
            addon.IsActive = dto.IsActive;

            await _unitOfWork.CompleteAsync();
            return _mapper.Map<AdminAddOnDto>(addon);
        }

        public async Task<IEnumerable<AdminServiceZoneDto>> GetServiceZonesAsync()
        {
            var zones = await _unitOfWork.ServiceZones.Query()
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .ToListAsync();

            return _mapper.Map<List<AdminServiceZoneDto>>(zones);
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

            await _unitOfWork.ServiceZones.AddAsync(zone);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<AdminServiceZoneDto>(zone);
        }

        public async Task<AdminServiceZoneDto?> UpdateServiceZoneAsync(Guid zoneId, UpsertServiceZoneDto dto)
        {
            var zone = await _unitOfWork.ServiceZones.Query()
                .Include(z => z.Bookings)
                .Include(z => z.Technicians)
                .FirstOrDefaultAsync(z => z.Id == zoneId);

            if (zone == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.ZoneName)) zone.ZoneName = dto.ZoneName.Trim();
            zone.Status = dto.Status;
            zone.BaseDistanceSurcharge = dto.BaseDistanceSurcharge;
            zone.PeakSurgeMultiplier = dto.PeakSurgeMultiplier > 0 ? dto.PeakSurgeMultiplier : 1.0f;
            zone.MaxTechnicians = dto.MaxTechnicians > 0 ? dto.MaxTechnicians : 10;

            await _unitOfWork.CompleteAsync();
            return _mapper.Map<AdminServiceZoneDto>(zone);
        }

        public async Task<IEnumerable<AdminDisputeDto>> GetDisputesAsync()
        {
            var disputes = await _unitOfWork.Disputes.Query()
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

            var dtos = _mapper.Map<List<AdminDisputeDto>>(disputes);
            for (int i = 0; i < disputes.Count; i++)
            {
                EnrichDisputeTiming(disputes[i], dtos[i]);
            }
            return dtos;
        }

        public async Task<AdminDisputeDto?> ResolveDisputeAsync(Guid disputeId, ResolveDisputeDto dto)
        {
            var dispute = await _unitOfWork.Disputes.Query()
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
                        while (await _unitOfWork.Bookings.AnyAsync(b => b.BookingNumber == rwNumber))
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
                        await _unitOfWork.Bookings.AddAsync(rewashBooking);

                        var tech = await _unitOfWork.Technicians.Query().Where(t => t.IsOnline).FirstOrDefaultAsync()
                            ?? await _unitOfWork.Technicians.FirstOrDefaultAsync(t => true);
                        if (tech != null)
                        {
                            await _unitOfWork.JobOffers.AddAsync(new JobOffer
                            {
                                BookingId = rewashBooking.Id,
                                TechnicianId = tech.Id,
                                Status = JobOfferStatus.OFFERED,
                                PayoutAmount = 0f,
                                OfferedAt = DateTime.UtcNow,
                                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                            });

                            await _unitOfWork.Notifications.AddAsync(new Notification
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

            await _unitOfWork.CompleteAsync();
            var resDto = _mapper.Map<AdminDisputeDto>(dispute);
            EnrichDisputeTiming(dispute, resDto);
            return resDto;
        }

        public async Task<IEnumerable<AdminPayoutDto>> GetPayoutsAsync()
        {
            var payouts = await _unitOfWork.Payouts.Query()
                .Include(p => p.Technician)
                .OrderByDescending(p => p.RequestedAt)
                .ToListAsync();

            return _mapper.Map<List<AdminPayoutDto>>(payouts);
        }

        public async Task<AdminPayoutDto?> ProcessPayoutAsync(Guid payoutId, bool approve)
        {
            var payout = await _unitOfWork.Payouts.Query()
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
                        await _unitOfWork.Notifications.AddAsync(new Notification
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
                        await _unitOfWork.Notifications.AddAsync(new Notification
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

                await _unitOfWork.CompleteAsync();
            }

            return _mapper.Map<AdminPayoutDto>(payout);
        }

        private static void EnrichBookingsTiming(List<Booking> sourceList, List<AdminBookingDto> dtos)
        {
            for (int i = 0; i < sourceList.Count && i < dtos.Count; i++)
            {
                var b = sourceList[i];
                var dto = dtos[i];

                var travelStart = b.OnTheWayAt ?? b.AcceptedAt;
                dto.TravelDurationMinutes = (travelStart.HasValue && b.ArrivedAt.HasValue)
                    ? Math.Max(1, (int)Math.Round((b.ArrivedAt.Value - travelStart.Value).TotalMinutes))
                    : null;

                dto.WorkDurationMinutes = (b.WashingStartedAt.HasValue && b.CompletedAt.HasValue)
                    ? Math.Max(1, (int)Math.Round((b.CompletedAt.Value - b.WashingStartedAt.Value).TotalMinutes))
                    : null;

                var tripStart = b.OnTheWayAt ?? b.AcceptedAt ?? b.WashingStartedAt;
                dto.TotalTripMinutes = (tripStart.HasValue && b.CompletedAt.HasValue)
                    ? Math.Max(1, (int)Math.Round((b.CompletedAt.Value - tripStart.Value).TotalMinutes))
                    : null;
            }
        }

        private static void EnrichDisputeTiming(Dispute d, AdminDisputeDto dto)
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

            dto.TravelDurationMinutes = travelMinutes;
            dto.WorkDurationMinutes = workMinutes;
            dto.ExpectedDurationMinutes = expectedMins;
            dto.IsDelayed = isDelayed;
            dto.DelayMinutes = delayMinutes;
            dto.DelaySummary = delaySummary;
            dto.EvidenceUrls = d.EvidenceUrls ?? new List<string>();
        }
    }
}
