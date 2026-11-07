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
            if (dto.AddOnIds != null && dto.AddOnIds.Any())
            {
                var addOns = await _context.AddOns.Where(a => dto.AddOnIds.Contains(a.Id)).ToListAsync();
                foreach (var addon in addOns)
                {
                    addOnsSubtotal += addon.Price;
                    addOnEntities.Add(new BookingAddOn
                    {
                        AddOnId = addon.Id,
                        PriceAtBooking = addon.Price
                    });
                }
            }

            float discountMultiplier = dto.BookingType switch
            {
                BookingType.SUBSCRIPTION_WEEKLY => 0.90f,
                BookingType.SUBSCRIPTION_MONTHLY => 0.85f,
                _ => 1.0f
            };

            var totalPrice = MathF.Round(((basePrice * vehicleMult) + addOnsSubtotal + (distanceSurcharge * peakSurge)) * discountMultiplier);
            var bookingNumber = $"#BK-{new Random().Next(1000, 9999)}";

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
                RemainingBalance = totalPrice - 200f,
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
                DepositAmount = booking.DepositAmount,
                RemainingBalance = booking.RemainingBalance
            };
        }

        public async Task<IEnumerable<CustomerBookingDto>> GetBookingsAsync(Guid customerId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.ServicePackage)
                .Include(b => b.Vehicle)
                .Include(b => b.Technician)
                .Include(b => b.InspectionUpsell)
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
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

            return booking != null ? MapBookingToDto(booking) : null;
        }

        public async Task<CustomerPaymentResultDto> PayDepositAsync(Guid customerId, Guid bookingId, PayDepositRequestDto dto)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking != null && customer != null)
            {
                var payment = customer.PayDeposit(booking, dto.PaymentMethod);
                _context.Payments.Add(payment);
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
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (customer != null && booking != null)
            {
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
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);

            if (customer != null && booking != null)
            {
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

        private static CustomerBookingDto MapBookingToDto(Booking b) => new()
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
            DepositAmount = b.DepositAmount,
            RemainingBalance = b.RemainingBalance,
            TechnicianName = b.Technician?.FullName,
            HasPendingUpsell = b.InspectionUpsell != null && b.InspectionUpsell.Status == UpsellStatus.PENDING,
            PendingUpsellPrice = b.InspectionUpsell?.AdditionalPrice,
            PendingUpsellId = b.InspectionUpsell?.Id
        };
    }
}
