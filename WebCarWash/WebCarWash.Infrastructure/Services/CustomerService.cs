using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Customer;
using WebCarWash.Application.Interfaces;
using WebCarWash.Application.Interfaces.Repositories;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private static readonly Guid DefaultDemoCustomerId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001");

        public CustomerService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CustomerCatalogDto> GetCatalogAsync()
        {
            var packages = await _unitOfWork.ServicePackages.Query()
                .OrderBy(p => p.BasePrice)
                .ToListAsync();

            var addOns = await _unitOfWork.AddOns.Query()
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.Price)
                .ToListAsync();

            var zones = await _unitOfWork.ServiceZones.Query()
                .Where(z => z.Status == ZoneStatus.ACTIVE)
                .ToListAsync();

            return new CustomerCatalogDto
            {
                Packages = _mapper.Map<List<CustomerCatalogPackageDto>>(packages),
                AddOns = _mapper.Map<List<CustomerCatalogAddOnDto>>(addOns),
                Zones = _mapper.Map<List<CustomerCatalogZoneDto>>(zones)
            };
        }

        public async Task<CustomerProfileDto?> GetProfileAsync(Guid customerId)
        {
            var customer = await _unitOfWork.Customers.Query()
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

            return _mapper.Map<CustomerProfileDto>(customer);
        }

        public async Task<CustomerProfileDto?> UpdateProfileAsync(Guid customerId, UpdateCustomerProfileDto dto)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            if (customer == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.FullName)) customer.FullName = dto.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Phone)) customer.Phone = dto.Phone.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Email)) customer.Email = dto.Email.Trim();
            if (dto.GateNotes != null) customer.GateNotes = dto.GateNotes.Trim();

            _unitOfWork.Customers.Update(customer);
            await _unitOfWork.CompleteAsync();
            return await GetProfileAsync(customerId);
        }

        public async Task<CustomerProfileDto?> TopUpWalletAsync(Guid customerId, float amount)
        {
            if (amount <= 0) return null;
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            if (customer == null) return null;

            customer.WalletBalance += amount;
            _unitOfWork.Customers.Update(customer);
            await _unitOfWork.CompleteAsync();
            return await GetProfileAsync(customerId);
        }

        public async Task<CustomerVehicleDto> AddVehicleAsync(Guid customerId, AddVehicleDto dto)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);

            var vehicle = _mapper.Map<Vehicle>(dto);
            vehicle.CustomerId = customerId;
            vehicle.Year = dto.Year > 0 ? dto.Year : DateTime.UtcNow.Year;
            vehicle.GetSizeMultiplier();

            if (customer != null)
            {
                customer.AddVehicle(vehicle);
                await _unitOfWork.Vehicles.AddAsync(vehicle);
                await _unitOfWork.CompleteAsync();
            }

            return _mapper.Map<CustomerVehicleDto>(vehicle);
        }

        public async Task<bool> DeleteVehicleAsync(Guid customerId, Guid vehicleId)
        {
            var vehicle = await _unitOfWork.Vehicles.FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customerId);
            if (vehicle != null)
            {
                var relatedBookings = await _unitOfWork.Bookings.FindAsync(b => b.VehicleId == vehicleId);
                if (relatedBookings.Any())
                {
                    _unitOfWork.Bookings.DeleteRange(relatedBookings);
                }

                _unitOfWork.Vehicles.Delete(vehicle);
                await _unitOfWork.CompleteAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<CustomerVehicleDto>> GetVehiclesAsync(Guid customerId)
        {
            var vehicles = await _unitOfWork.Vehicles.FindAsync(v => v.CustomerId == customerId);
            return _mapper.Map<List<CustomerVehicleDto>>(vehicles);
        }

        public async Task<CustomerBookingDto> CreateBookingAsync(Guid customerId, CreateCustomerBookingDto dto)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            var package = await _unitOfWork.ServicePackages.FirstOrDefaultAsync(p => p.Id == dto.ServicePackageId)
                          ?? await _unitOfWork.ServicePackages.FirstOrDefaultAsync(p => true);

            var vehicle = await _unitOfWork.Vehicles.FirstOrDefaultAsync(v => v.Id == dto.VehicleId)
                          ?? await _unitOfWork.Vehicles.FirstOrDefaultAsync(v => v.CustomerId == customerId);

            var zone = await _unitOfWork.ServiceZones.FirstOrDefaultAsync(z => z.Id == dto.ServiceZoneId)
                       ?? await _unitOfWork.ServiceZones.FirstOrDefaultAsync(z => true);

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
                var addOns = await _unitOfWork.AddOns.FindAsync(a => distinctIds.Contains(a.Id));
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
            while (await _unitOfWork.Bookings.AnyAsync(b => b.BookingNumber == bookingNumber))
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
                await _unitOfWork.Bookings.AddAsync(booking);
                await _unitOfWork.CompleteAsync();
            }

            var bookingDto = _mapper.Map<CustomerBookingDto>(booking);
            bookingDto.ServiceName = package?.Name ?? "Premium Wash";
            bookingDto.VehicleName = vehicle != null ? $"{vehicle.Make} {vehicle.Model}" : "Car";
            bookingDto.LicensePlate = vehicle?.LicensePlate ?? "ABC 123";
            bookingDto.AddOnNames = addOnNames;
            bookingDto.CanCancel = true;
            return bookingDto;
        }

        public async Task<IEnumerable<CustomerBookingDto>> GetBookingsAsync(Guid customerId)
        {
            var bookings = await _unitOfWork.Bookings.Query()
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

            return bookings.Select(MapBookingToDto);
        }

        public async Task<CustomerBookingDto?> GetBookingDetailsAsync(Guid customerId, Guid bookingId)
        {
            var booking = await _unitOfWork.Bookings.Query()
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
            var booking = await _unitOfWork.Bookings.Query()
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

            if (booking.TechnicianId == null)
            {
                var relatedNotifications = await _unitOfWork.Notifications.FindAsync(n => n.Description.Contains(booking.BookingNumber));
                if (relatedNotifications.Any())
                {
                    _unitOfWork.Notifications.DeleteRange(relatedNotifications);
                }

                _unitOfWork.Bookings.Delete(booking);
                await _unitOfWork.CompleteAsync();

                return new CancelBookingResultDto
                {
                    Success = true,
                    Deleted = true,
                    Status = "DELETED",
                    Message = $"Booking {booking.BookingNumber} cancelled and removed before technician acceptance."
                };
            }

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

            await _unitOfWork.Notifications.AddAsync(new Notification
            {
                UserId = techId,
                Title = "Booking Cancelled by Customer",
                Description = $"Customer cancelled booking {booking.BookingNumber} within the 2-minute grace window.",
                Type = "AlertCircle",
                IsRead = false,
                CreatedAt = now
            });

            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.CompleteAsync();

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
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            var booking = await _unitOfWork.Bookings.Query()
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
                    await _unitOfWork.Payments.AddAsync(payment);
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

                if (booking.TechnicianId == null)
                {
                    var hasActiveOffer = await _unitOfWork.JobOffers.AnyAsync(o =>
                        o.BookingId == booking.Id &&
                        (o.Status == JobOfferStatus.OFFERED || o.Status == JobOfferStatus.ACCEPTED));

                    if (!hasActiveOffer)
                    {
                        var tech = await _unitOfWork.Technicians.Query()
                            .Where(t => t.IsOnline && t.ServiceZoneId == booking.ServiceZoneId)
                            .FirstOrDefaultAsync()
                            ?? await _unitOfWork.Technicians.Query().Where(t => t.IsOnline).FirstOrDefaultAsync()
                            ?? await _unitOfWork.Technicians.FirstOrDefaultAsync(t => true);

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
                            await _unitOfWork.JobOffers.AddAsync(jobOffer);

                            await _unitOfWork.Notifications.AddAsync(new Notification
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

                _unitOfWork.Customers.Update(customer);
                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.CompleteAsync();

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
            var upsell = await _unitOfWork.InspectionUpsells.Query()
                .Include(u => u.Booking)
                .FirstOrDefaultAsync(u => u.Id == upsellId);

            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);

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
                _unitOfWork.InspectionUpsells.Update(upsell);
                await _unitOfWork.CompleteAsync();
                return true;
            }

            return true;
        }

        public async Task<CustomerReviewResultDto> SubmitReviewAsync(Guid customerId, Guid bookingId, SubmitCustomerReviewDto dto)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            var booking = await _unitOfWork.Bookings.Query()
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

                await _unitOfWork.Reviews.AddAsync(review);
                await _unitOfWork.CompleteAsync();

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
            var reviews = await _unitOfWork.Reviews.Query()
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
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            var booking = await _unitOfWork.Bookings.Query()
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
                await _unitOfWork.Disputes.AddAsync(dispute);
                await _unitOfWork.CompleteAsync();

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
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            if (customer != null && !string.IsNullOrWhiteSpace(address))
            {
                var trimmed = address.Trim();
                customer.SavedAddresses ??= new List<string>();
                if (!customer.SavedAddresses.Contains(trimmed))
                {
                    var updated = new List<string>(customer.SavedAddresses) { trimmed };
                    customer.SavedAddresses = updated;
                    _unitOfWork.Customers.Update(customer);
                    await _unitOfWork.CompleteAsync();
                }
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteSavedAddressAsync(Guid customerId, string address)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(customerId);
            if (customer != null && !string.IsNullOrWhiteSpace(address))
            {
                var trimmed = address.Trim();
                customer.SavedAddresses ??= new List<string>();
                var updated = customer.SavedAddresses.Where(a => !string.Equals(a, trimmed, StringComparison.OrdinalIgnoreCase)).ToList();
                customer.SavedAddresses = updated;
                _unitOfWork.Customers.Update(customer);
                await _unitOfWork.CompleteAsync();
                return true;
            }
            return false;
        }

        private CustomerBookingDto MapBookingToDto(Booking b)
        {
            var now = DateTime.UtcNow;
            var canCancel = b.CanCustomerCancel(now);
            var remainingSec = b.GetCancelSecondsRemaining(now);
            var deadline = b.AcceptedAt?.AddMinutes(Booking.CancellationGraceMinutes);

            var dto = _mapper.Map<CustomerBookingDto>(b);
            dto.BasePackagePrice = b.BasePackagePrice > 0 ? b.BasePackagePrice : (b.ServicePackage?.BasePrice ?? b.TotalPrice);
            dto.VehicleMultiplier = b.VehicleMultiplier > 0 ? b.VehicleMultiplier : 1.0f;
            dto.PeakSurgeMultiplier = b.PeakSurgeMultiplier > 0 ? b.PeakSurgeMultiplier : 1.0f;
            dto.RemainingBalance = MathF.Max(0f, b.TotalPrice - b.DepositAmount);
            dto.AddOnNames = b.BookingAddOns?.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() ?? new List<string>();
            dto.HasPendingUpsell = b.InspectionUpsell != null && b.InspectionUpsell.Status == UpsellStatus.PENDING;
            dto.PendingUpsellPrice = b.InspectionUpsell?.AdditionalPrice;
            dto.PendingUpsellId = b.InspectionUpsell?.Id;
            dto.PendingUpsellReason = b.InspectionUpsell?.TechnicianNote;
            dto.HasReview = b.Review != null;
            dto.HasDispute = b.Dispute != null;
            dto.CancelDeadlineUtc = deadline;
            dto.CanCancel = canCancel;
            dto.CancelSecondsRemaining = remainingSec;
            dto.IsLockedIn = !canCancel && b.Status != BookingStatus.CANCELLED && b.Status != BookingStatus.COMPLETED;

            return dto;
        }
    }
}
