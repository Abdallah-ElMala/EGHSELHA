using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Technician;
using WebCarWash.Application.Interfaces;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Data;

namespace WebCarWash.Infrastructure.Services
{
    public class TechnicianService : ITechnicianService
    {
        private readonly CarWashDbContext _context;

        public TechnicianService(CarWashDbContext context)
        {
            _context = context;
        }

        public async Task<TechnicianDashboardDto?> GetDashboardAsync(Guid technicianId)
        {
            var tech = await _context.Technicians
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Customer)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Vehicle)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.ServicePackage)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            // Fallback mock data if technician not found in DB yet
            if (tech == null)
            {
                return GetDefaultDashboard();
            }

            var todayDate = DateTime.UtcNow.Date;
            var todayBookings = tech.Bookings
                .Where(b => b.ScheduledAt.Date == todayDate || b.Status != BookingStatus.COMPLETED)
                .OrderBy(b => b.ScheduledAt)
                .ToList();

            var nextBooking = todayBookings.FirstOrDefault(b => b.Status is BookingStatus.DISPATCHED or BookingStatus.ARRIVED or BookingStatus.WASHING);

            return new TechnicianDashboardDto
            {
                JobsToday = todayBookings.Count > 0 ? todayBookings.Count : 3,
                JobsTodayChange = "+1 from yesterday",
                TodayEarnings = tech.TodayEarnings > 0 ? tech.TodayEarnings : 850f,
                TodayEarningsChange = "+12.5% this week",
                Rating = tech.Rating > 0 ? tech.Rating : 4.9f,
                ReviewCount = 128,
                HoursWorked = 5.5f,
                TodayJobs = todayBookings.Select(b => new TechnicianJobSummaryDto
                {
                    Id = b.BookingNumber,
                    Time = b.ScheduledAt.ToString("hh:mm tt"),
                    Service = b.ServicePackage?.Name ?? "Car Wash",
                    Status = MapBookingStatusToFrontend(b.Status),
                    Customer = b.Customer?.FullName ?? "Customer",
                    Address = string.IsNullOrEmpty(b.Address) ? "Cairo, Nasr City" : b.Address,
                    Distance = b.DistanceText
                }).ToList(),
                NextCustomer = nextBooking != null ? new NextCustomerDto
                {
                    Customer = nextBooking.Customer?.FullName ?? "Ahmed Khaled",
                    Car = nextBooking.Vehicle != null ? $"{nextBooking.Vehicle.Make} {nextBooking.Vehicle.Model}" : "Hyundai Elantra",
                    Service = nextBooking.ServicePackage?.Name ?? "Premium Wash",
                    Eta = "12 min",
                    Distance = nextBooking.DistanceText,
                    Address = string.IsNullOrEmpty(nextBooking.Address) ? "Cairo, Nasr City" : nextBooking.Address,
                    Latitude = nextBooking.ParkingLatitude,
                    Longitude = nextBooking.ParkingLongitude
                } : GetDefaultNextCustomer(),
                WeeklyPerformance = GetDefaultWeeklyPerformance(),
                Checklist = GetDefaultChecklist()
            };
        }

        public async Task<IEnumerable<TechnicianJobDto>> GetJobsAsync(Guid technicianId, string? status = null, string? search = null)
        {
            var tech = await _context.Technicians
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Customer)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Vehicle)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.ServicePackage)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            var list = new List<TechnicianJobDto>();

            if (tech != null && tech.Bookings.Any())
            {
                list = tech.Bookings.Select(b => MapToJobDto(b)).ToList();
            }
            else
            {
                list = GetDefaultJobs();
            }

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                list = list.Where(j => j.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                list = list.Where(j =>
                    j.BookingNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    j.Customer.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    j.Car.Contains(search, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            return list;
        }

        public async Task<TechnicianJobDto?> GetJobDetailsAsync(Guid technicianId, string bookingIdOrNumber)
        {
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Vehicle)
                .Include(b => b.ServicePackage)
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                return MapToJobDto(booking);
            }

            var defaultJobs = GetDefaultJobs();
            return defaultJobs.FirstOrDefault(j => j.Id.Equals(bookingIdOrNumber, StringComparison.OrdinalIgnoreCase) || j.BookingNumber.Equals(bookingIdOrNumber, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<bool> UpdateJobStatusAsync(Guid technicianId, string bookingIdOrNumber, string newStatus)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                booking.Status = MapFrontendStatusToBookingStatus(newStatus);
                await _context.SaveChangesAsync();
                return true;
            }

            return true; // For demo/mock state
        }

        public async Task<TechnicianEarningsDto?> GetEarningsAsync(Guid technicianId)
        {
            var tech = await _context.Technicians
                .Include(t => t.Payouts)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.ServicePackage)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Customer)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech == null)
            {
                return GetDefaultEarnings();
            }

            return new TechnicianEarningsDto
            {
                TotalEarnings = tech.TotalBalance > 0 ? tech.TotalBalance : 8450f,
                TotalEarningsChange = "+18.2% this month",
                ThisMonth = 3250f,
                ThisMonthChange = "12 completed jobs",
                PendingPayout = 500f,
                NextPayoutInfo = "Next payout Nov 05",
                AveragePerJob = 352f,
                AverageChange = "Across 24 jobs",
                Weekly = new List<DailyBarStatDto>
                {
                    new() { Day = "Mon", Percentage = 35 },
                    new() { Day = "Tue", Percentage = 58 },
                    new() { Day = "Wed", Percentage = 45 },
                    new() { Day = "Thu", Percentage = 80 },
                    new() { Day = "Fri", Percentage = 62 },
                    new() { Day = "Sat", Percentage = 95 },
                    new() { Day = "Sun", Percentage = 70 }
                },
                Transactions = GetDefaultTransactions()
            };
        }

        public async Task<TechnicianProfileDto?> GetProfileAsync(Guid technicianId)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech == null)
            {
                return new TechnicianProfileDto
                {
                    Name = "Mostafa Ali",
                    Email = "mostafa.ali@email.com",
                    Phone = "+20 100 123 4567",
                    Area = "Nasr City, Cairo",
                    Bio = "Professional car care technician with 3+ years of experience.",
                    Rating = 4.9f,
                    ReviewCount = 128,
                    JobsDone = 246,
                    IsVerified = true
                };
            }

            return new TechnicianProfileDto
            {
                Name = tech.FullName,
                Email = tech.Email,
                Phone = tech.Phone,
                Area = string.IsNullOrEmpty(tech.ServiceArea) ? "Nasr City, Cairo" : tech.ServiceArea,
                Bio = string.IsNullOrEmpty(tech.ShortBio) ? "Professional car care technician with 3+ years of experience." : tech.ShortBio,
                Rating = tech.Rating > 0 ? tech.Rating : 4.9f,
                ReviewCount = 128,
                JobsDone = 246,
                IsVerified = true,
                PhotoPreview = tech.AvatarUrl
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid technicianId, TechnicianProfileDto dto)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech != null)
            {
                tech.FullName = dto.Name;
                tech.Email = dto.Email;
                tech.Phone = dto.Phone;
                tech.ServiceArea = dto.Area;
                tech.ShortBio = dto.Bio;
                if (!string.IsNullOrEmpty(dto.PhotoPreview))
                {
                    tech.AvatarUrl = dto.PhotoPreview;
                }
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<TechnicianSettingsDto?> GetSettingsAsync(Guid technicianId)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech == null)
            {
                return new TechnicianSettingsDto
                {
                    Available = true,
                    WorkingDays = "Sunday – Thursday",
                    WorkingHours = "09:00 AM – 06:00 PM",
                    Push = true,
                    Sms = false,
                    Email = true
                };
            }

            return new TechnicianSettingsDto
            {
                Available = tech.IsOnline,
                WorkingDays = tech.WorkingDays,
                WorkingHours = tech.WorkingHours,
                Push = tech.PushNotificationsEnabled,
                Sms = tech.SmsNotificationsEnabled,
                Email = tech.EmailNotificationsEnabled
            };
        }

        public async Task<bool> UpdateSettingsAsync(Guid technicianId, TechnicianSettingsDto dto)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech != null)
            {
                tech.IsOnline = dto.Available;
                tech.WorkingDays = dto.WorkingDays;
                tech.WorkingHours = dto.WorkingHours;
                tech.PushNotificationsEnabled = dto.Push;
                tech.SmsNotificationsEnabled = dto.Sms;
                tech.EmailNotificationsEnabled = dto.Email;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<IEnumerable<TechnicianNotificationDto>> GetNotificationsAsync(Guid technicianId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == technicianId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            if (notifications.Any())
            {
                return notifications.Select(n => new TechnicianNotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Desc = n.Description,
                    Time = GetTimeAgo(n.CreatedAt),
                    IconType = n.Type,
                    IsUnread = !n.IsRead
                });
            }

            return GetDefaultNotifications();
        }

        public async Task<bool> MarkNotificationsAsReadAsync(Guid technicianId)
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == technicianId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateGPSLocationAsync(Guid technicianId, float lat, float lng)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech != null)
            {
                tech.UpdateGPSLocation(lat, lng);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> ToggleAvailabilityAsync(Guid technicianId, bool isOnline)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech != null)
            {
                tech.ToggleAvailability(isOnline);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> MarkArrivedAsync(Guid technicianId, string bookingIdOrNumber)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                booking.Status = BookingStatus.ARRIVED;
                await _context.SaveChangesAsync();
                return true;
            }
            return true;
        }

        public async Task<PhotoQADto?> UploadQAPhotoAsync(Guid technicianId, string bookingIdOrNumber, UploadQAPhotoDto dto)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            var bookingId = booking?.Id ?? (Guid.TryParse(bookingIdOrNumber, out var parsedGuid) ? parsedGuid : Guid.NewGuid());

            var photo = new PhotoQA
            {
                BookingId = bookingId,
                PhotoType = dto.PhotoType,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                GpsLatitude = dto.GpsLatitude,
                GpsLongitude = dto.GpsLongitude,
                Timestamp = DateTime.UtcNow,
                IsVerified = true
            };

            photo.ValidateLocation();

            if (booking != null)
            {
                _context.PhotoQAs.Add(photo);
                await _context.SaveChangesAsync();
            }

            return new PhotoQADto
            {
                Id = photo.Id,
                BookingId = photo.BookingId,
                PhotoType = photo.PhotoType.ToString(),
                Category = photo.Category.ToString(),
                ImageUrl = photo.ImageUrl,
                Timestamp = photo.Timestamp,
                GpsLatitude = photo.GpsLatitude,
                GpsLongitude = photo.GpsLongitude,
                IsVerified = photo.IsVerified
            };
        }

        public async Task<IEnumerable<PhotoQADto>> GetQAPhotosAsync(Guid technicianId, string bookingIdOrNumber)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                var photos = await _context.PhotoQAs
                    .Where(p => p.BookingId == booking.Id)
                    .OrderBy(p => p.Timestamp)
                    .ToListAsync();

                return photos.Select(p => new PhotoQADto
                {
                    Id = p.Id,
                    BookingId = p.BookingId,
                    PhotoType = p.PhotoType.ToString(),
                    Category = p.Category.ToString(),
                    ImageUrl = p.ImageUrl,
                    Timestamp = p.Timestamp,
                    GpsLatitude = p.GpsLatitude,
                    GpsLongitude = p.GpsLongitude,
                    IsVerified = p.IsVerified
                });
            }

            return Enumerable.Empty<PhotoQADto>();
        }

        public async Task<InspectionUpsellDto?> ProposeUpsellAsync(Guid technicianId, string bookingIdOrNumber, ProposeUpsellDto dto)
        {
            var booking = await _context.Bookings
                .Include(b => b.InspectionUpsell)
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            var bookingId = booking?.Id ?? (Guid.TryParse(bookingIdOrNumber, out var parsedGuid) ? parsedGuid : Guid.NewGuid());

            var upsell = new InspectionUpsell
            {
                BookingId = bookingId,
                TechnicianNote = dto.Reason,
                AdditionalPrice = dto.AdditionalPrice,
                EvidencePhotoUrl = dto.EvidencePhotoUrl ?? string.Empty,
                Status = UpsellStatus.PENDING,
                RequestedAt = DateTime.UtcNow
            };

            if (booking != null)
            {
                _context.InspectionUpsells.Add(upsell);
                await _context.SaveChangesAsync();
            }

            return new InspectionUpsellDto
            {
                Id = upsell.Id,
                BookingId = upsell.BookingId,
                TechnicianNote = upsell.TechnicianNote,
                AdditionalPrice = upsell.AdditionalPrice,
                EvidencePhotoUrl = upsell.EvidencePhotoUrl,
                Status = upsell.Status.ToString(),
                RequestedAt = upsell.RequestedAt
            };
        }

        public async Task<InspectionUpsellDto?> GetUpsellAsync(Guid technicianId, string bookingIdOrNumber)
        {
            var booking = await _context.Bookings
                .Include(b => b.InspectionUpsell)
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking?.InspectionUpsell != null)
            {
                var u = booking.InspectionUpsell;
                return new InspectionUpsellDto
                {
                    Id = u.Id,
                    BookingId = u.BookingId,
                    TechnicianNote = u.TechnicianNote,
                    AdditionalPrice = u.AdditionalPrice,
                    EvidencePhotoUrl = u.EvidencePhotoUrl,
                    Status = u.Status.ToString(),
                    RequestedAt = u.RequestedAt,
                    RespondedAt = u.RespondedAt
                };
            }

            return null;
        }

        public async Task<PayoutDto?> RequestPayoutAsync(Guid technicianId, RequestPayoutDto dto)
        {
            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
            if (tech != null)
            {
                if (dto.Amount > tech.TotalBalance && tech.TotalBalance > 0)
                {
                    dto.Amount = tech.TotalBalance;
                }
                var payout = tech.RequestPayout(dto.PayoutMethod, dto.Amount, dto.AccountDetails);
                _context.Payouts.Add(payout);
                await _context.SaveChangesAsync();

                return new PayoutDto
                {
                    Id = payout.Id,
                    Amount = payout.Amount,
                    PayoutMethod = payout.PayoutMethod,
                    AccountDetails = payout.AccountDetails,
                    Status = payout.Status,
                    RequestedAt = payout.RequestedAt
                };
            }

            return new PayoutDto
            {
                Id = Guid.NewGuid(),
                Amount = dto.Amount,
                PayoutMethod = dto.PayoutMethod,
                AccountDetails = dto.AccountDetails,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };
        }

        public async Task<IEnumerable<PayoutDto>> GetPayoutHistoryAsync(Guid technicianId)
        {
            var payouts = await _context.Payouts
                .Where(p => p.TechnicianId == technicianId)
                .OrderByDescending(p => p.RequestedAt)
                .ToListAsync();

            if (payouts.Any())
            {
                return payouts.Select(p => new PayoutDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    PayoutMethod = p.PayoutMethod,
                    AccountDetails = p.AccountDetails,
                    Status = p.Status,
                    RequestedAt = p.RequestedAt,
                    ProcessedAt = p.ProcessedAt
                });
            }

            return new List<PayoutDto>
            {
                new() { Id = Guid.NewGuid(), Amount = 1200f, PayoutMethod = "Instapay", AccountDetails = "mostafa@instapay", Status = "Processed", RequestedAt = DateTime.UtcNow.AddDays(-2), ProcessedAt = DateTime.UtcNow.AddDays(-2).AddHours(2) },
                new() { Id = Guid.NewGuid(), Amount = 800f, PayoutMethod = "Vodafone Cash", AccountDetails = "01001234567", Status = "Processed", RequestedAt = DateTime.UtcNow.AddDays(-7), ProcessedAt = DateTime.UtcNow.AddDays(-7).AddHours(1) }
            };
        }

        public async Task<IEnumerable<JobOfferDto>> GetJobOffersAsync(Guid technicianId)
        {
            var offers = await _context.JobOffers
                .Include(o => o.Booking)
                    .ThenInclude(b => b.Customer)
                .Include(o => o.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .Include(o => o.Booking)
                    .ThenInclude(b => b.Vehicle)
                .Where(o => o.TechnicianId == technicianId && o.Status == JobOfferStatus.OFFERED && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.OfferedAt)
                .ToListAsync();

            if (offers.Any())
            {
                return offers.Select(o => new JobOfferDto
                {
                    Id = o.Id,
                    BookingId = o.BookingId,
                    BookingNumber = o.Booking?.BookingNumber ?? "#BK-OFFER",
                    CustomerName = o.Booking?.Customer?.FullName ?? "New Customer",
                    CustomerAddress = o.Booking?.Address ?? "Nasr City, Cairo",
                    DistanceText = o.Booking?.DistanceText ?? "2.8 km",
                    ServiceName = o.Booking?.ServicePackage?.Name ?? "Premium Wash",
                    VehicleModel = o.Booking?.Vehicle != null ? $"{o.Booking.Vehicle.Make} {o.Booking.Vehicle.Model}" : "Sedan",
                    PayoutAmount = o.PayoutAmount > 0 ? o.PayoutAmount : 280f,
                    OfferedAt = o.OfferedAt,
                    ExpiresAt = o.ExpiresAt,
                    RemainingSeconds = Math.Max(0, (int)(o.ExpiresAt - DateTime.UtcNow).TotalSeconds),
                    Status = o.Status.ToString()
                });
            }

            return new List<JobOfferDto>
            {
                new()
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    BookingId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001"),
                    BookingNumber = "#BK-0030",
                    CustomerName = "Tamer Hosny",
                    CustomerAddress = "Nasr City, Abbas El Akkad",
                    DistanceText = "1.8 km",
                    ServiceName = "Ultimate Detail",
                    VehicleModel = "BMW 520i (Black)",
                    PayoutAmount = 490f,
                    OfferedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddSeconds(45),
                    RemainingSeconds = 45,
                    Status = "OFFERED"
                }
            };
        }

        public async Task<bool> RespondToJobOfferAsync(Guid technicianId, Guid offerId, bool accept)
        {
            var offer = await _context.JobOffers
                .Include(o => o.Booking)
                .FirstOrDefaultAsync(o => o.Id == offerId);

            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);

            if (offer != null && tech != null)
            {
                return tech.RespondToJobOffer(offer, accept);
            }

            return true;
        }

        #region Helpers & Default Mock Data

        private static string MapBookingStatusToFrontend(BookingStatus status) => status switch
        {
            BookingStatus.PENDING or BookingStatus.DEPOSIT_PAID => "Upcoming",
            BookingStatus.DISPATCHED => "Upcoming",
            BookingStatus.ARRIVED => "On The Way",
            BookingStatus.WASHING => "In Progress",
            BookingStatus.COMPLETED => "Completed",
            _ => "Upcoming"
        };

        private static BookingStatus MapFrontendStatusToBookingStatus(string frontendStatus) => frontendStatus.ToLower() switch
        {
            "upcoming" => BookingStatus.DISPATCHED,
            "on the way" => BookingStatus.ARRIVED,
            "in progress" => BookingStatus.WASHING,
            "completed" => BookingStatus.COMPLETED,
            _ => BookingStatus.DISPATCHED
        };

        private static TechnicianJobDto MapToJobDto(Booking b) => new()
        {
            Id = b.BookingNumber,
            BookingNumber = b.BookingNumber,
            Customer = b.Customer?.FullName ?? "Customer",
            Phone = b.Customer?.Phone ?? "+20 100 123 4567",
            Service = b.ServicePackage?.Name ?? "Car Wash",
            Car = b.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model}" : "Sedan",
            Date = b.ScheduledAt.ToString("MMM dd"),
            Time = b.ScheduledAt.ToString("hh:mm tt"),
            Price = b.TotalPrice,
            Status = MapBookingStatusToFrontend(b.Status),
            Address = string.IsNullOrEmpty(b.Address) ? "Cairo, Nasr City" : b.Address,
            Distance = b.DistanceText,
            Latitude = b.ParkingLatitude,
            Longitude = b.ParkingLongitude
        };

        private static TechnicianDashboardDto GetDefaultDashboard() => new()
        {
            JobsToday = 3,
            JobsTodayChange = "+1 from yesterday",
            TodayEarnings = 850f,
            TodayEarningsChange = "+12.5% this week",
            Rating = 4.9f,
            ReviewCount = 128,
            HoursWorked = 5.5f,
            TodayJobs = new List<TechnicianJobSummaryDto>
            {
                new() { Id = "#BK-0024", Time = "10:00 AM", Service = "Premium Wash", Status = "In Progress", Customer = "Ahmed Khaled", Address = "Cairo, Nasr City", Distance = "3.2 km" },
                new() { Id = "#BK-0025", Time = "12:30 PM", Service = "Deep Clean", Status = "Upcoming", Customer = "Sara Mahmoud", Address = "Cairo, Heliopolis", Distance = "5.1 km" },
                new() { Id = "#BK-0026", Time = "03:00 PM", Service = "Basic Wash", Status = "Upcoming", Customer = "Omar Hassan", Address = "Cairo, Maadi", Distance = "7.4 km" }
            },
            NextCustomer = GetDefaultNextCustomer(),
            WeeklyPerformance = GetDefaultWeeklyPerformance(),
            Checklist = GetDefaultChecklist()
        };

        private static NextCustomerDto GetDefaultNextCustomer() => new()
        {
            Customer = "Ahmed Khaled",
            Car = "Hyundai Elantra",
            Service = "Premium Wash",
            Eta = "12 min",
            Distance = "3.2 km",
            Address = "Nasr City, Cairo",
            Latitude = 30.0561f,
            Longitude = 31.3414f
        };

        private static List<WeeklyPerformancePointDto> GetDefaultWeeklyPerformance() => new()
        {
            new() { Day = "Mon", CompletedJobs = 12 },
            new() { Day = "Tue", CompletedJobs = 15 },
            new() { Day = "Wed", CompletedJobs = 11 },
            new() { Day = "Thu", CompletedJobs = 18 },
            new() { Day = "Fri", CompletedJobs = 14 },
            new() { Day = "Sat", CompletedJobs = 20 },
            new() { Day = "Sun", CompletedJobs = 16 }
        };

        private static List<ChecklistItemDto> GetDefaultChecklist() => new()
        {
            new() { Title = "Check your equipment", Status = "Done" },
            new() { Title = "Review today's schedule", Status = "Done" },
            new() { Title = "Upload vehicle cleaning kit photo", Status = "Pending" }
        };

        private static List<TechnicianJobDto> GetDefaultJobs() => new()
        {
            new()
            {
                Id = "#BK-0024",
                BookingNumber = "#BK-0024",
                Customer = "Ahmed Khaled",
                Phone = "+20 100 999 1111",
                Service = "Premium Wash",
                Car = "Hyundai Elantra",
                Date = "Today, Nov 03",
                Time = "10:00 AM – 11:00 AM",
                Price = 350f,
                Status = "In Progress",
                Address = "Cairo, Nasr City",
                Distance = "3.2 km",
                Latitude = 30.0561f,
                Longitude = 31.3414f
            },
            new()
            {
                Id = "#BK-0025",
                BookingNumber = "#BK-0025",
                Customer = "Sara Mahmoud",
                Phone = "+20 101 222 3333",
                Service = "Deep Clean",
                Car = "Kia Sportage",
                Date = "Today, Nov 03",
                Time = "12:30 PM – 02:00 PM",
                Price = 500f,
                Status = "Upcoming",
                Address = "Cairo, Heliopolis",
                Distance = "5.1 km",
                Latitude = 30.0889f,
                Longitude = 31.3285f
            },
            new()
            {
                Id = "#BK-0026",
                BookingNumber = "#BK-0026",
                Customer = "Omar Hassan",
                Phone = "+20 102 333 4444",
                Service = "Basic Wash",
                Car = "Nissan Sunny",
                Date = "Today, Nov 03",
                Time = "03:00 PM – 03:30 PM",
                Price = 200f,
                Status = "Upcoming",
                Address = "Cairo, Maadi",
                Distance = "7.4 km",
                Latitude = 29.9602f,
                Longitude = 31.2569f
            },
            new()
            {
                Id = "#BK-0021",
                BookingNumber = "#BK-0021",
                Customer = "Mariam Adel",
                Phone = "+20 103 444 5555",
                Service = "Ultimate Detail",
                Car = "BMW X5",
                Date = "Nov 02",
                Time = "01:00 PM – 03:00 PM",
                Price = 700f,
                Status = "Completed",
                Address = "Cairo, New Cairo",
                Distance = "10.2 km",
                Latitude = 30.0278f,
                Longitude = 31.4913f
            }
        };

        private static TechnicianEarningsDto GetDefaultEarnings() => new()
        {
            TotalEarnings = 8450f,
            TotalEarningsChange = "+18.2% this month",
            ThisMonth = 3250f,
            ThisMonthChange = "12 completed jobs",
            PendingPayout = 500f,
            NextPayoutInfo = "Next payout Nov 05",
            AveragePerJob = 352f,
            AverageChange = "Across 24 jobs",
            Weekly = new List<DailyBarStatDto>
            {
                new() { Day = "Mon", Percentage = 35 },
                new() { Day = "Tue", Percentage = 58 },
                new() { Day = "Wed", Percentage = 45 },
                new() { Day = "Thu", Percentage = 80 },
                new() { Day = "Fri", Percentage = 62 },
                new() { Day = "Sat", Percentage = 95 },
                new() { Day = "Sun", Percentage = 70 }
            },
            Transactions = GetDefaultTransactions()
        };

        private static List<TransactionRowDto> GetDefaultTransactions() => new()
        {
            new() { Date = "Nov 03", Service = "Premium Wash", Customer = "Ahmed Khaled", Amount = 350f, Status = "Paid" },
            new() { Date = "Nov 03", Service = "Deep Clean", Customer = "Sara Mahmoud", Amount = 500f, Status = "Pending" },
            new() { Date = "Nov 02", Service = "Ultimate Detail", Customer = "Mariam Adel", Amount = 700f, Status = "Paid" },
            new() { Date = "Nov 01", Service = "Basic Wash", Customer = "Youssef Samir", Amount = 200f, Status = "Paid" },
            new() { Date = "Oct 31", Service = "Premium Wash", Customer = "Omar Fathy", Amount = 350f, Status = "Paid" }
        };

        private static List<TechnicianNotificationDto> GetDefaultNotifications() => new()
        {
            new() { Id = Guid.NewGuid(), Title = "Booking assigned", Desc = "You have received a new booking #BK-0026.", Time = "5 min ago", IconType = "BriefcaseBusiness", IsUnread = true },
            new() { Id = Guid.NewGuid(), Title = "Customer update", Desc = "Ahmed Khaled confirmed the service details.", Time = "35 min ago", IconType = "UserRound", IsUnread = false },
            new() { Id = Guid.NewGuid(), Title = "Payout processed", Desc = "Your payout of EGP 1,200 has been processed.", Time = "Yesterday", IconType = "Wallet", IsUnread = false },
            new() { Id = Guid.NewGuid(), Title = "Great feedback!", Desc = "You received a 5-star review from Mariam.", Time = "Yesterday", IconType = "Star", IsUnread = false }
        };

        private static string GetTimeAgo(DateTime dt)
        {
            var span = DateTime.UtcNow - dt;
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} min ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours} hours ago";
            if (span.TotalDays < 2) return "Yesterday";
            return dt.ToString("MMM dd");
        }

        #endregion
    }
}
