using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Customer;
using WebCarWash.Application.Interfaces;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Data;

namespace WebCarWash.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly CarWashDbContext _context;
        private static readonly Guid DefaultDemoCustomerId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001");

        public CustomerService(CarWashDbContext context)
        {
            _context = context;
        }

        public async Task<CustomerCatalogDto> GetCatalogAsync()
        {
            var packages = await _context.ServicePackages
                .OrderBy(p => p.BasePrice)
                .ToListAsync();
            var addOns = await _context.AddOns
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.Price)
                .ToListAsync();
            var zones = await _context.ServiceZones
                .Where(z => z.Status == ZoneStatus.ACTIVE)
                .ToListAsync();

            return new CustomerCatalogDto
            {
                Packages = packages.Select(p => new CustomerCatalogPackageDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    BasePrice = p.BasePrice,
                    DurationMinutes = p.DurationMinutes,
                    RequiresElectricity = p.RequiresElectricity,
                    RequiresWater = p.RequiresWater,
                    RequiresPrivateParking = p.RequiresPrivateParking
                }).ToList(),
                AddOns = addOns.Select(a => new CustomerCatalogAddOnDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Price = a.Price,
                    Description = a.Description
                }).ToList(),
                Zones = zones.Select(z => new CustomerCatalogZoneDto
                {
                    Id = z.Id,
                    ZoneName = z.ZoneName,
                    BaseDistanceSurcharge = z.BaseDistanceSurcharge,
                    PeakSurgeMultiplier = z.PeakSurgeMultiplier
                }).ToList()
            };
        }

        public async Task<CustomerProfileDto?> GetProfileAsync(Guid customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.Vehicles)
                .Include(c => c.Bookings)
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                return new CustomerProfileDto
                {
                    Id = customerId,
                    FullName = "Ahmed Khaled",
                    Phone = "+20 100 999 1111",
                    Email = "ahmed.khaled@example.com",
                    WalletBalance = 650f,
                    LoyaltyPoints = 250,
                    GateNotes = "Gate 3, Villa 22. Please call upon arrival.",
                    SavedAddresses = new List<string> { "Nasr City, Abbas El Akkad, Cairo", "Heliopolis, Korba, Cairo" }
                };
            }

            return new CustomerProfileDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                Phone = customer.Phone,
                Email = customer.Email,
                WalletBalance = customer.WalletBalance,
                LoyaltyPoints = customer.LoyaltyPoints,
                GateNotes = customer.GateNotes,
                SavedAddresses = customer.SavedAddresses ?? new List<string>()
            };
        }

        public async Task<CustomerProfileDto?> UpdateProfileAsync(Guid customerId, UpdateCustomerProfileDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            if (customer == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.FullName)) customer.FullName = dto.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Phone)) customer.Phone = dto.Phone.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Email)) customer.Email = dto.Email.Trim();
            if (dto.GateNotes != null) customer.GateNotes = dto.GateNotes.Trim();

            await _context.SaveChangesAsync();
            return await GetProfileAsync(customerId);
        }

        public async Task<CustomerProfileDto?> TopUpWalletAsync(Guid customerId, float amount)
        {
            if (amount <= 0) return null;
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            if (customer == null) return null;

            customer.WalletBalance += amount;
            await _context.SaveChangesAsync();
            return await GetProfileAsync(customerId);
        }

        public async Task<CustomerVehicleDto> AddVehicleAsync(Guid customerId, AddVehicleDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);

            var vehicle = new Vehicle
            {
                CustomerId = customerId,
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year > 0 ? dto.Year : DateTime.UtcNow.Year,
                Color = dto.Color,
                LicensePlate = dto.LicensePlate,
                SizeType = dto.SizeType,
                PhotoUrl = dto.PhotoUrl
            };

            vehicle.GetSizeMultiplier();

            if (customer != null)
            {
                customer.AddVehicle(vehicle);
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
            }

            return new CustomerVehicleDto
            {
                Id = vehicle.Id,
                Make = vehicle.Make,
                Model = vehicle.Model,
                Year = vehicle.Year,
                Color = vehicle.Color,
                LicensePlate = vehicle.LicensePlate,
                SizeType = vehicle.SizeType.ToString(),
                SizeMultiplier = vehicle.SizeMultiplier,
                PhotoUrl = vehicle.PhotoUrl
            };
        }

        public async Task<bool> DeleteVehicleAsync(Guid customerId, Guid vehicleId)
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
            if (vehicle != null)
            {
                var relatedBookings = await _context.Bookings
                    .Where(b => b.VehicleId == vehicleId)
                    .ToListAsync();

                if (relatedBookings.Any())
                {
                    _context.Bookings.RemoveRange(relatedBookings);
                }

                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<CustomerVehicleDto>> GetVehiclesAsync(Guid customerId)
        {
            var vehicles = await _context.Vehicles
                .Where(v => v.CustomerId == customerId)
                .ToListAsync();

            if (vehicles.Any())
            {
                return vehicles.Select(v => new CustomerVehicleDto
                {
                    Id = v.Id,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Color = v.Color,
                    LicensePlate = v.LicensePlate,
                    SizeType = v.SizeType.ToString(),
                    SizeMultiplier = v.SizeMultiplier,
                    PhotoUrl = v.PhotoUrl
                });
            }

            return new List<CustomerVehicleDto>();
        }

        public async Task<CustomerBookingDto> CreateBookingAsync(Guid customerId, CreateCustomerBookingDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var package = await _context.ServicePackages.FirstOrDefaultAsync(p => p.Id == dto.ServicePackageId)
                          ?? await _context.ServicePackages.FirstOrDefaultAsync();

            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == dto.VehicleId)
                          ?? await _context.Vehicles.FirstOrDefaultAsync(v => v.CustomerId == customerId);

            var zone = await _context.ServiceZones.FirstOrDefaultAsync(z => z.Id == dto.ServiceZoneId)
                       ?? await _context.ServiceZones.FirstOrDefaultAsync();

            var basePrice = package?.BasePrice ?? 350f;
            var vehicleMult = vehicle?.GetSizeMultiplier() ?? 1.0f;
            var distanceSurcharge = zone?.BaseDistanceSurcharge ?? 20f;
            var peakSurge = zone?.PeakSurgeMultiplier ?? 1.0f;

            // Add-ons subtotal
            float addOnsSubtotal = 0f;
            var addOnEntities = new List<BookingAddOn>();
            var addOnNames = new List<string>();
            if (dto.AddOnIds != null && dto.AddOnIds.Any())
            {
                var distinctIds = dto.AddOnIds.Distinct().ToList();
                var addOns = await _context.AddOns.Where(a => distinctIds.Contains(a.Id)).ToListAsync();
                foreach (var addon in addOns)
                {
                    addOnsSubtotal += addon.Price;
                    addOnNames.Add(addon.Name);
                    addOnEntities.Add(new BookingAddOn
                    {
                        AddOnId = addon.Id,
                        PriceAtBooking = addon.Price,
                        AddOn = addon
                    });
                }
            }

            float discountMultiplier = dto.BookingType switch
            {
                BookingType.SUBSCRIPTION_WEEKLY => 0.90f,
                BookingType.SUBSCRIPTION_MONTHLY => 0.85f,
                _ => 1.0f
            };

            var rawTotal = ((basePrice * vehicleMult) + addOnsSubtotal + (distanceSurcharge * peakSurge)) * discountMultiplier;
            var totalPrice = (float)Math.Round(rawTotal, MidpointRounding.AwayFromZero);
            var bookingNumber = $"#BK-{Random.Shared.Next(1000, 9999)}";
            while (await _context.Bookings.AnyAsync(b => b.BookingNumber == bookingNumber))
            {
                bookingNumber = $"#BK-{Random.Shared.Next(1000, 9999)}";
            }

            var booking = new Booking
            {
                BookingNumber = bookingNumber,
                CustomerId = customerId,
                ServicePackageId = package?.Id ?? Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001"),
                VehicleId = vehicle?.Id ?? Guid.NewGuid(),
                ServiceZoneId = zone?.Id ?? Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                ScheduledAt = dto.ScheduledAt,
                BookingType = dto.BookingType,
                ParkingType = dto.ParkingType,
                HasElectricity = dto.HasElectricity,
                HasWaterAccess = dto.HasWaterAccess,
                Address = string.IsNullOrWhiteSpace(dto.Address) ? "Nasr City, Abbas El Akkad" : dto.Address,
                ParkingLatitude = dto.ParkingLatitude,
                ParkingLongitude = dto.ParkingLongitude,
                BasePackagePrice = basePrice,
                VehicleMultiplier = vehicleMult,
                AddOnsSubtotal = addOnsSubtotal,
                DistanceSurcharge = distanceSurcharge,
                PeakSurgeMultiplier = peakSurge,
                TotalPrice = totalPrice,
                DepositAmount = 200f,
                RemainingBalance = MathF.Max(0f, totalPrice - 200f),
                Status = BookingStatus.PENDING,
                BookingAddOns = addOnEntities
            };

            if (customer != null)
            {
                customer.CreateBooking(booking);
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
            }

            return new CustomerBookingDto
            {
                Id = booking.Id,
                BookingNumber = booking.BookingNumber,
                Status = booking.Status.ToString(),
                BookingType = booking.BookingType.ToString(),
                ScheduledAt = booking.ScheduledAt,
                Address = booking.Address,
                ServiceName = package?.Name ?? "Premium Wash",
                VehicleName = vehicle != null ? $"{vehicle.Make} {vehicle.Model}" : "Car",
                LicensePlate = vehicle?.LicensePlate ?? "ABC 123",
                TotalPrice = booking.TotalPrice,
                BasePackagePrice = booking.BasePackagePrice,
                VehicleMultiplier = booking.VehicleMultiplier,
                AddOnsSubtotal = booking.AddOnsSubtotal,
                DistanceSurcharge = booking.DistanceSurcharge,
                PeakSurgeMultiplier = booking.PeakSurgeMultiplier,
                UpsellTotal = booking.UpsellTotal,
                DepositAmount = booking.DepositAmount,
                RemainingBalance = booking.RemainingBalance,
                AddOnNames = addOnNames,
                CanCancel = true,
                CancelSecondsRemaining = 0,
                IsLockedIn = false
            };
        }

        public async Task<IEnumerable<CustomerBookingDto>> GetBookingsAsync(Guid customerId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.ServicePackage)
                .Include(b => b.Vehicle)
                .Include(b => b.Technician)
                .Include(b => b.InspectionUpsell)
                .Include(b => b.Review)
                .Include(b => b.Dispute)
                .Include(b => b.BookingAddOns)
                    .ThenInclude(ba => ba.AddOn)
                .Where(b => b.CustomerId == customerId)
                .OrderByDescending(b => b.ScheduledAt)
                .ToListAsync();

            if (bookings.Any())
            {
                return bookings.Select(b => MapBookingToDto(b));
            }

            return new List<CustomerBookingDto>();
        }

        public async Task<CustomerBookingDto?> GetBookingDetailsAsync(Guid customerId, Guid bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.ServicePackage)
                .Include(b => b.Vehicle)
                .Include(b => b.Technician)
                .Include(b => b.InspectionUpsell)
                .Include(b => b.Review)
                .Include(b => b.Dispute)
                .Include(b => b.BookingAddOns)
                    .ThenInclude(ba => ba.AddOn)
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

            return booking != null ? MapBookingToDto(booking) : null;
        }

        public async Task<CancelBookingResultDto> CancelOrDeleteBookingAsync(Guid customerId, Guid bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.JobOffers)
                .Include(b => b.Payments)
                .Include(b => b.BookingAddOns)
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

            if (booking == null)
            {
                return new CancelBookingResultDto
                {
                    Success = false,
                    Status = "NOT_FOUND",
                    Message = "Booking not found."
                };
            }

            var now = DateTime.UtcNow;
            if (!booking.CanCustomerCancel(now))
            {
                var reason = booking.Status == BookingStatus.COMPLETED
                    ? "Completed bookings cannot be cancelled."
                    : booking.Status == BookingStatus.CANCELLED
                    ? "Booking is already cancelled."
                    : "The 2-minute cancellation window after technician acceptance has expired. Your technician is locked in and coming to you.";

                return new CancelBookingResultDto
                {
                    Success = false,
                    Status = booking.Status.ToString(),
                    Message = reason
                };
            }

            // Before any technician accepts: delete completely so it does not appear to any technician
            if (booking.TechnicianId == null)
            {
                var relatedNotifications = await _context.Notifications
                    .Where(n => n.Description.Contains(booking.BookingNumber))
                    .ToListAsync();

                if (relatedNotifications.Any())
                {
                    _context.Notifications.RemoveRange(relatedNotifications);
                }

                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();

                return new CancelBookingResultDto
                {
                    Success = true,
                    Deleted = true,
                    Status = "DELETED",
                    Message = $"Booking {booking.BookingNumber} cancelled and removed before technician acceptance."
                };
            }

            // Within 2-minute grace window after technician accepted: mark cancelled & notify technician
            var techId = booking.TechnicianId.Value;
            booking.Status = BookingStatus.CANCELLED;
            booking.CancelledBy = "CUSTOMER";
            foreach (var offer in booking.JobOffers)
            {
                if (offer.Status == JobOfferStatus.OFFERED || offer.Status == JobOfferStatus.ACCEPTED)
                {
                    offer.Expire();
                }
            }

            _context.Notifications.Add(new Notification
            {
                UserId = techId,
                Title = "Booking Cancelled by Customer",
                Description = $"Customer cancelled booking {booking.BookingNumber} within the 2-minute grace window.",
                Type = "AlertCircle",
                IsRead = false,
                CreatedAt = now
            });

            await _context.SaveChangesAsync();

            return new CancelBookingResultDto
            {
                Success = true,
                Deleted = false,
                Status = "CANCELLED",
                Message = $"Booking {booking.BookingNumber} cancelled within the 2-minute grace period. Technician has been notified."
            };
        }

        public async Task<CustomerPaymentResultDto> PayDepositAsync(Guid customerId, Guid bookingId, PayDepositRequestDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var booking = await _context.Bookings
                .Include(b => b.ServicePackage)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking != null && customer != null)
            {
                Payment payment;
                if (booking.Status == BookingStatus.PENDING)
                {
                    if (dto.PaymentMethod == PaymentMethod.WALLET)
                    {
                        if (customer.WalletBalance < 200f)
                        {
                            return new CustomerPaymentResultDto
                            {
                                PaymentId = Guid.Empty,
                                BookingId = booking.Id,
                                Amount = 200f,
                                PaymentMethod = dto.PaymentMethod.ToString(),
                                Status = "FAILED",
                                TransactionRef = string.Empty,
                                PaidAt = DateTime.UtcNow
                            };
                        }
                        customer.WalletBalance -= 200f;
                    }

                    payment = customer.PayDeposit(booking, dto.PaymentMethod);
                    _context.Payments.Add(payment);
                }
                else
                {
                    payment = booking.Payments.FirstOrDefault(p => p.PaymentType == PaymentType.DEPOSIT) ?? new Payment
                    {
                        BookingId = booking.Id,
                        Amount = 200f,
                        PaymentType = PaymentType.DEPOSIT,
                        PaymentMethod = dto.PaymentMethod,
                        Status = PaymentStatus.SUCCESS,
                        TransactionRef = $"TXN-DEP-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                        PaidAt = DateTime.UtcNow
                    };
                }

                // Dispatch a JobOffer to an available technician if not already assigned/offered
                if (booking.TechnicianId == null)
                {
                    var hasActiveOffer = await _context.JobOffers.AnyAsync(o =>
                        o.BookingId == booking.Id &&
                        (o.Status == JobOfferStatus.OFFERED || o.Status == JobOfferStatus.ACCEPTED));

                    if (!hasActiveOffer)
                    {
                        var tech = await _context.Technicians
                            .Where(t => t.IsOnline && t.ServiceZoneId == booking.ServiceZoneId)
                            .FirstOrDefaultAsync()
                            ?? await _context.Technicians.Where(t => t.IsOnline).FirstOrDefaultAsync()
                            ?? await _context.Technicians.FirstOrDefaultAsync();

                        if (tech != null)
                        {
                            var jobOffer = new JobOffer
                            {
                                BookingId = booking.Id,
                                TechnicianId = tech.Id,
                                Status = JobOfferStatus.OFFERED,
                                PayoutAmount = (float)Math.Round(booking.TotalPrice * 0.7f, MidpointRounding.AwayFromZero),
                                OfferedAt = DateTime.UtcNow,
                                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                            };
                            _context.JobOffers.Add(jobOffer);

                            _context.Notifications.Add(new Notification
                            {
                                UserId = tech.Id,
                                Title = "New Booking Request",
                                Description = $"Booking {booking.BookingNumber} ({booking.ServicePackage?.Name ?? "Car Wash"}) is confirmed and waiting for your acceptance.",
                                Type = "BriefcaseBusiness",
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return new CustomerPaymentResultDto
                {
                    PaymentId = payment.Id,
                    BookingId = booking.Id,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod.ToString(),
                    Status = payment.Status.ToString(),
                    TransactionRef = payment.TransactionRef,
                    PaidAt = payment.PaidAt ?? DateTime.UtcNow
                };
            }

            return new CustomerPaymentResultDto
            {
                PaymentId = Guid.NewGuid(),
                BookingId = bookingId,
                Amount = 200f,
                PaymentMethod = dto.PaymentMethod.ToString(),
                Status = "SUCCESS",
                TransactionRef = $"TXN-DEP-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                PaidAt = DateTime.UtcNow
            };
        }

        public async Task<bool> ApproveUpsellAsync(Guid customerId, Guid upsellId, bool decision)
        {
            var upsell = await _context.InspectionUpsells
                .Include(u => u.Booking)
                .FirstOrDefaultAsync(u => u.Id == upsellId);

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);

            if (upsell != null)
            {
                if (upsell.Status != UpsellStatus.PENDING)
                {
                    return false;
                }

                if (customer != null)
                {
                    customer.ApproveUpsell(upsell, decision);
                }
                else
                {
                    if (decision) upsell.Approve(); else upsell.Decline();
                }
                await _context.SaveChangesAsync();
                return true;
            }

            return true;
        }

        public async Task<CustomerReviewResultDto> SubmitReviewAsync(Guid customerId, Guid bookingId, SubmitCustomerReviewDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var booking = await _context.Bookings
                .Include(b => b.Technician)
                .Include(b => b.Review)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (customer != null && booking != null)
            {
                if (booking.Review != null)
                {
                    return new CustomerReviewResultDto
                    {
                        ReviewId = booking.Review.Id,
                        BookingId = booking.Id,
                        AverageRating = booking.Review.AverageRating,
                        LoyaltyPointsEarned = 0,
                        ReviewedAt = DateTime.UtcNow
                    };
                }

                var review = customer.SubmitReview(
                    booking,
                    dto.PunctualityRating,
                    dto.CleanlinessRating,
                    dto.ProfessionalismRating,
                    dto.SelectedTags,
                    dto.TipAmount,
                    dto.CommentText
                );

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return new CustomerReviewResultDto
                {
                    ReviewId = review.Id,
                    BookingId = booking.Id,
                    AverageRating = review.AverageRating,
                    LoyaltyPointsEarned = 50,
                    ReviewedAt = DateTime.UtcNow
                };
            }

            var avg = (dto.PunctualityRating + dto.CleanlinessRating + dto.ProfessionalismRating) / 3.0f;
            return new CustomerReviewResultDto
            {
                ReviewId = Guid.NewGuid(),
                BookingId = bookingId,
                AverageRating = avg,
                LoyaltyPointsEarned = 50,
                ReviewedAt = DateTime.UtcNow
            };
        }

        public async Task<IEnumerable<CustomerReviewItemDto>> GetReviewsAsync(Guid customerId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .Include(r => r.Booking)
                    .ThenInclude(b => b.Vehicle)
                .Include(r => r.Booking)
                    .ThenInclude(b => b.Technician)
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.Booking != null ? r.Booking.ScheduledAt : DateTime.MinValue)
                .ToListAsync();

            return reviews.Select(r => new CustomerReviewItemDto
            {
                Id = r.Id,
                BookingId = r.BookingId,
                BookingNumber = r.Booking?.BookingNumber ?? "#BK-0000",
                PackageName = r.Booking?.ServicePackage?.Name ?? "Premium Wash",
                VehicleName = r.Booking?.Vehicle != null ? $"{r.Booking.Vehicle.Make} {r.Booking.Vehicle.Model}" : "Registered Car",
                TechnicianName = r.Booking?.Technician?.FullName ?? "Certified Technician",
                AverageRating = r.AverageRating,
                PunctualityRating = r.PunctualityRating,
                CleanlinessRating = r.CleanlinessRating,
                ProfessionalismRating = r.ProfessionalismRating,
                SelectedTags = r.SelectedTags ?? new List<string>(),
                TipAmount = r.TipAmount,
                CommentText = r.CommentText ?? string.Empty,
                ReviewedAt = r.Booking?.ScheduledAt ?? DateTime.UtcNow,
                LoyaltyPointsEarned = 50
            });
        }

        public async Task<CustomerDisputeResultDto> FileDisputeAsync(Guid customerId, Guid bookingId, FileCustomerDisputeDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var booking = await _context.Bookings
                .Include(b => b.Dispute)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (customer != null && booking != null)
            {
                if (booking.Dispute != null)
                {
                    return new CustomerDisputeResultDto
                    {
                        DisputeId = booking.Dispute.Id,
                        BookingId = booking.Id,
                        Reason = booking.Dispute.Reason,
                        Status = booking.Dispute.Status.ToString(),
                        FiledAt = booking.Dispute.FiledAt
                    };
                }

                var dispute = customer.FileDispute(booking, dto.Reason, dto.EvidenceUrls);
                _context.Disputes.Add(dispute);
                await _context.SaveChangesAsync();

                return new CustomerDisputeResultDto
                {
                    DisputeId = dispute.Id,
                    BookingId = booking.Id,
                    Reason = dispute.Reason,
                    Status = dispute.Status.ToString(),
                    FiledAt = dispute.FiledAt
                };
            }

            return new CustomerDisputeResultDto
            {
                DisputeId = Guid.NewGuid(),
                BookingId = bookingId,
                Reason = dto.Reason,
                Status = "OPEN",
                FiledAt = DateTime.UtcNow
            };
        }

        public async Task<bool> AddSavedAddressAsync(Guid customerId, string address)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            if (customer != null && !string.IsNullOrWhiteSpace(address))
            {
                var trimmed = address.Trim();
                customer.SavedAddresses ??= new List<string>();
                if (!customer.SavedAddresses.Contains(trimmed))
                {
                    var updated = new List<string>(customer.SavedAddresses) { trimmed };
                    customer.SavedAddresses = updated;
                    _context.Entry(customer).Property(c => c.SavedAddresses).IsModified = true;
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteSavedAddressAsync(Guid customerId, string address)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            if (customer != null && !string.IsNullOrWhiteSpace(address))
            {
                var trimmed = address.Trim();
                customer.SavedAddresses ??= new List<string>();
                var updated = customer.SavedAddresses.Where(a => !string.Equals(a, trimmed, StringComparison.OrdinalIgnoreCase)).ToList();
                customer.SavedAddresses = updated;
                _context.Entry(customer).Property(c => c.SavedAddresses).IsModified = true;
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        private static CustomerBookingDto MapBookingToDto(Booking b)
        {
            var now = DateTime.UtcNow;
            var canCancel = b.CanCustomerCancel(now);
            var remainingSec = b.GetCancelSecondsRemaining(now);
            var deadline = b.AcceptedAt?.AddMinutes(Booking.CancellationGraceMinutes);

            return new CustomerBookingDto
            {
                Id = b.Id,
                BookingNumber = b.BookingNumber,
                Status = b.Status.ToString(),
                BookingType = b.BookingType.ToString(),
                ScheduledAt = b.ScheduledAt,
                Address = b.Address,
                ServiceName = b.ServicePackage?.Name ?? "Car Wash",
                VehicleName = b.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model}" : "Sedan",
                LicensePlate = b.Vehicle?.LicensePlate ?? "",
                TotalPrice = b.TotalPrice,
                BasePackagePrice = b.BasePackagePrice > 0 ? b.BasePackagePrice : (b.ServicePackage?.BasePrice ?? b.TotalPrice),
                VehicleMultiplier = b.VehicleMultiplier > 0 ? b.VehicleMultiplier : 1.0f,
                AddOnsSubtotal = b.AddOnsSubtotal,
                DistanceSurcharge = b.DistanceSurcharge,
                PeakSurgeMultiplier = b.PeakSurgeMultiplier > 0 ? b.PeakSurgeMultiplier : 1.0f,
                UpsellTotal = b.UpsellTotal,
                DepositAmount = b.DepositAmount,
                RemainingBalance = MathF.Max(0f, b.TotalPrice - b.DepositAmount),
                AddOnNames = b.BookingAddOns?.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() ?? new List<string>(),
                TechnicianName = b.Technician?.FullName,
                TechnicianPhone = b.Technician?.Phone,
                TechnicianLatitude = b.Technician?.CurrentLatitude,
                TechnicianLongitude = b.Technician?.CurrentLongitude,
                HasPendingUpsell = b.InspectionUpsell != null && b.InspectionUpsell.Status == UpsellStatus.PENDING,
                PendingUpsellPrice = b.InspectionUpsell?.AdditionalPrice,
                PendingUpsellId = b.InspectionUpsell?.Id,
                PendingUpsellReason = b.InspectionUpsell?.TechnicianNote,
                HasReview = b.Review != null,
                HasDispute = b.Dispute != null,
                AcceptedAt = b.AcceptedAt,
                CancelDeadlineUtc = deadline,
                CanCancel = canCancel,
                CancelSecondsRemaining = remainingSec,
                IsLockedIn = !canCancel && b.Status != BookingStatus.CANCELLED && b.Status != BookingStatus.COMPLETED
            };
        }
    }
}
