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
                .Where(b => b.Status != BookingStatus.CANCELLED && (b.ScheduledAt.Date == todayDate || b.Status != BookingStatus.COMPLETED))
                .OrderBy(b => b.Status == BookingStatus.COMPLETED)
                .ThenByDescending(b => b.ScheduledAt)
                .ToList();

            var nextBooking = todayBookings.FirstOrDefault(b => b.Status is BookingStatus.DISPATCHED or BookingStatus.ON_THE_WAY or BookingStatus.ARRIVED or BookingStatus.WASHING);
            var (rating, reviewCount, _) = await GetTechnicianMetricsAsync(technicianId);

            return new TechnicianDashboardDto
            {
                JobsToday = todayBookings.Count,
                JobsTodayChange = $"{todayBookings.Count(b => b.Status == BookingStatus.COMPLETED)} completed",
                TodayEarnings = tech.TodayEarnings,
                TodayEarningsChange = "70% technician share",
                Rating = rating,
                ReviewCount = reviewCount,
                HoursWorked = MathF.Round(tech.Bookings.Count(b => b.Status == BookingStatus.COMPLETED && b.ScheduledAt.Date == todayDate) * 1.25f, 1),
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
                    Customer = nextBooking.Customer?.FullName ?? "Customer",
                    Car = nextBooking.Vehicle != null ? $"{nextBooking.Vehicle.Make} {nextBooking.Vehicle.Model}" : "Car",
                    Service = nextBooking.ServicePackage?.Name ?? "Car Wash",
                    Eta = "12 min",
                    Distance = nextBooking.DistanceText,
                    Address = string.IsNullOrEmpty(nextBooking.Address) ? "Cairo, Nasr City" : nextBooking.Address,
                    Latitude = nextBooking.ParkingLatitude,
                    Longitude = nextBooking.ParkingLongitude
                } : null,
                WeeklyPerformance = Enumerable.Range(0, 7)
                    .Select(offset =>
                    {
                        var dayDate = DateTime.Today.AddDays(-6 + offset);
                        return new WeeklyPerformancePointDto
                        {
                            Day = dayDate.ToString("ddd"),
                            CompletedJobs = tech.Bookings.Count(b => b.Status == BookingStatus.COMPLETED && b.ScheduledAt.Date == dayDate)
                        };
                    }).ToList(),
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
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.BookingAddOns)
                        .ThenInclude(ba => ba.AddOn)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            var list = new List<TechnicianJobDto>();

            if (tech != null && tech.Bookings.Any())
            {
                list = tech.Bookings
                    .Where(b => b.Status != BookingStatus.CANCELLED)
                    .OrderBy(b => b.Status == BookingStatus.COMPLETED)
                    .ThenByDescending(b => b.ScheduledAt)
                    .Select(b => MapToJobDto(b))
                    .ToList();
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
                .Include(b => b.BookingAddOns)
                    .ThenInclude(ba => ba.AddOn)
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                return MapToJobDto(booking);
            }

            return null;
        }

        public async Task<bool> UpdateJobStatusAsync(Guid technicianId, string bookingIdOrNumber, string newStatus)
        {
            var (success, _) = await UpdateJobStatusDetailedAsync(technicianId, bookingIdOrNumber, newStatus);
            return success;
        }

        public async Task<(bool Success, string? ErrorMessage)> UpdateJobStatusDetailedAsync(Guid technicianId, string bookingIdOrNumber, string newStatus)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingNumber == bookingIdOrNumber || b.Id.ToString() == bookingIdOrNumber);

            if (booking != null)
            {
                var mappedStatus = MapFrontendStatusToBookingStatus(newStatus);

                if (mappedStatus == BookingStatus.WASHING && booking.Status != BookingStatus.WASHING)
                {
                    var beforeCount = await _context.PhotoQAs.CountAsync(p => p.BookingId == booking.Id && p.PhotoType == PhotoType.BEFORE);
                    if (beforeCount < 6)
                    {
                        return (false, $"Capture and upload 6 Before photos before starting the wash (uploaded {beforeCount}/6).");
                    }
                }

                if (mappedStatus == BookingStatus.COMPLETED && booking.Status != BookingStatus.COMPLETED)
                {
                    var beforeCount = await _context.PhotoQAs.CountAsync(p => p.BookingId == booking.Id && p.PhotoType == PhotoType.BEFORE);
                    var afterCount = await _context.PhotoQAs.CountAsync(p => p.BookingId == booking.Id && p.PhotoType == PhotoType.AFTER);
                    if (beforeCount < 6 || afterCount < 6)
                    {
                        return (false, $"Capture all 6 Before ({beforeCount}/6) and 6 After ({afterCount}/6) photos before completing the job.");
                    }

                    var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);
                    if (tech != null)
                    {
                        booking.TechnicianId ??= tech.Id;
                        tech.MarkCompleted(booking);
                    }
                    else
                    {
                        booking.Status = BookingStatus.COMPLETED;
                    }
                    booking.CompletedAt ??= DateTime.UtcNow;
                }
                else
                {
                    booking.Status = mappedStatus;
                    var now = DateTime.UtcNow;
                    if (mappedStatus == BookingStatus.ON_THE_WAY) booking.OnTheWayAt ??= now;
                    else if (mappedStatus == BookingStatus.ARRIVED) booking.ArrivedAt ??= now;
                    else if (mappedStatus == BookingStatus.WASHING) booking.WashingStartedAt ??= now;
                    else if (mappedStatus == BookingStatus.CANCELLED)
                    {
                        booking.CancelledBy = "TECHNICIAN";
                        _context.Notifications.Add(new Notification
                        {
                            UserId = booking.CustomerId,
                            Title = "Booking Cancelled by Technician",
                            Description = $"Technician had to cancel booking {booking.BookingNumber}. Admin will reassign or refund your deposit.",
                            Type = "AlertCircle",
                            IsRead = false,
                            CreatedAt = now
                        });
                    }
                }
                await _context.SaveChangesAsync();
                return (true, null);
            }

            return (true, null);
        }

        private static bool IsCommittedPayout(string? status) =>
            !string.Equals(status, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "Canceled", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "Rejected", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "Failed", StringComparison.OrdinalIgnoreCase);

        public async Task<TechnicianEarningsDto?> GetEarningsAsync(Guid technicianId, string? range = "7d")
        {
            var tech = await _context.Technicians
                .Include(t => t.Payouts)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.ServicePackage)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Customer)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Review)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech == null)
            {
                return GetDefaultEarnings();
            }

            static float CalcTechEarning(Booking b) =>
                (float)Math.Round(b.TotalPrice * 0.7f, MidpointRounding.AwayFromZero) + (b.Review?.TipAmount ?? 0f);

            var activeAndCompletedBookings = tech.Bookings
                .Where(b => b.Status != BookingStatus.CANCELLED)
                .ToList();

            var completedBookings = activeAndCompletedBookings
                .Where(b => b.Status == BookingStatus.COMPLETED)
                .ToList();

            var totalEarned = completedBookings.Sum(CalcTechEarning);
            var completedCount = completedBookings.Count;

            var now = DateTime.UtcNow;
            var thisMonthBookings = completedBookings
                .Where(b => b.ScheduledAt.Year == now.Year && b.ScheduledAt.Month == now.Month)
                .ToList();
            var thisMonthEarned = thisMonthBookings.Sum(CalcTechEarning);

            // Only count Pending & Processed/Approved payouts; Cancelled/Rejected payouts stay in AvailableBalance
            var totalPayoutsCommitted = tech.Payouts
                .Where(p => IsCommittedPayout(p.Status))
                .Sum(p => p.Amount);
            var pendingPayouts = tech.Payouts
                .Where(p => string.Equals(p.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                .Sum(p => p.Amount);
            var availableBalance = MathF.Max(0f, totalEarned - totalPayoutsCommitted);

            // Keep persisted TotalBalance consistent with actual completed earnings minus non-cancelled payouts
            if (MathF.Abs(tech.TotalBalance - availableBalance) > 0.01f)
            {
                tech.TotalBalance = availableBalance;
                await _context.SaveChangesAsync();
            }

            var avgPerJob = completedCount > 0
                ? (float)Math.Round(totalEarned / completedCount, MidpointRounding.AwayFromZero)
                : 0f;

            // Anchor chart window on the latest completed booking date (or today if no future-scheduled jobs)
            var today = DateTime.Today;
            var latestCompletedDate = completedBookings.Any()
                ? completedBookings.Max(b => b.ScheduledAt.Date)
                : today;
            var anchorDate = latestCompletedDate > today ? latestCompletedDate : today;

            var normalizedRange = string.IsNullOrWhiteSpace(range) ? "7d" : range.Trim().ToLowerInvariant();
            List<(string Day, string DateLabel, float Amount)> buckets;

            if (normalizedRange == "30d")
            {
                buckets = Enumerable.Range(0, 4)
                    .Select(idx =>
                    {
                        var start = anchorDate.AddDays(-27 + idx * 7);
                        var end = start.AddDays(6);
                        var sum = completedBookings
                            .Where(b => b.ScheduledAt.Date >= start && b.ScheduledAt.Date <= end)
                            .Sum(CalcTechEarning);
                        return ($"Wk {idx + 1}", $"{start:MMM dd}-{end:dd}", sum);
                    })
                    .ToList();
            }
            else if (normalizedRange == "year" || normalizedRange == "12m")
            {
                normalizedRange = "year";
                var anchorMonth = new DateTime(anchorDate.Year, anchorDate.Month, 1);
                buckets = Enumerable.Range(0, 6)
                    .Select(idx =>
                    {
                        var monthStart = anchorMonth.AddMonths(-5 + idx);
                        var sum = completedBookings
                            .Where(b => b.ScheduledAt.Year == monthStart.Year && b.ScheduledAt.Month == monthStart.Month)
                            .Sum(CalcTechEarning);
                        return (monthStart.ToString("MMM"), monthStart.ToString("yyyy"), sum);
                    })
                    .ToList();
            }
            else
            {
                normalizedRange = "7d";
                buckets = Enumerable.Range(0, 7)
                    .Select(offset =>
                    {
                        var dayDate = anchorDate.AddDays(-6 + offset);
                        var sum = completedBookings
                            .Where(b => b.ScheduledAt.Date == dayDate)
                            .Sum(CalcTechEarning);
                        return (dayDate.ToString("ddd"), dayDate.ToString("MMM dd"), sum);
                    })
                    .ToList();
            }

            var chartTotal = buckets.Sum(d => d.Amount);
            var maxBar = Math.Max(buckets.Max(d => d.Amount), 1f);
            var weeklyStats = buckets.Select(d => new DailyBarStatDto
            {
                Day = d.Day,
                DateLabel = d.DateLabel,
                Amount = d.Amount,
                Percentage = d.Amount > 0 ? Math.Max(14, (int)Math.Round((d.Amount / maxBar) * 76f)) : 0
            }).ToList();

            var transactions = activeAndCompletedBookings
                .OrderByDescending(b => b.ScheduledAt)
                .Select(b => new TransactionRowDto
                {
                    Date = b.ScheduledAt.ToString("MMM dd"),
                    Service = $"{b.ServicePackage?.Name ?? "Car Wash"} ({b.BookingNumber})",
                    Customer = b.Customer?.FullName ?? "Customer",
                    Amount = CalcTechEarning(b),
                    BookingTotal = b.TotalPrice,
                    Status = b.Status == BookingStatus.COMPLETED ? "Paid" : "Pending"
                })
                .ToList();

            var payoutHistory = tech.Payouts
                .OrderByDescending(p => p.RequestedAt)
                .Select(p => new PayoutDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    PayoutMethod = p.PayoutMethod,
                    AccountDetails = p.AccountDetails,
                    Status = p.Status,
                    RequestedAt = p.RequestedAt
                })
                .ToList();

            return new TechnicianEarningsDto
            {
                TotalEarnings = totalEarned,
                AvailableBalance = availableBalance,
                TotalEarningsChange = $"Available: EGP {availableBalance:N0} · {completedCount} completed",
                ThisMonth = thisMonthEarned,
                ThisMonthChange = $"{thisMonthBookings.Count} completed this month",
                PendingPayout = pendingPayouts,
                NextPayoutInfo = pendingPayouts > 0 ? "Pending withdrawal" : $"Withdrawable: EGP {availableBalance:N0}",
                AveragePerJob = avgPerJob,
                AverageChange = $"Across {completedCount} completed jobs (70% share)",
                ChartRange = normalizedRange,
                ChartTotal = chartTotal,
                Weekly = weeklyStats,
                Transactions = transactions,
                Payouts = payoutHistory
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
                    DateOfBirth = "1995-01-01",
                    Equipment = new List<string>
                    {
                        "Pressure Washer 2200 PSI",
                        "Wet & Dry Vacuum Extractor",
                        "120L Water Tank & Generator",
                        "Microfiber Detailing Kit"
                    },
                    VehicleType = "Service Van",
                    VehicleName = "Suzuki Carry 2022",
                    VehiclePlate = "س ص ع 4821",
                    Rating = 0f,
                    ReviewCount = 0,
                    JobsDone = 0,
                    IsVerified = true
                };
            }

            var (rating, reviewCount, jobsDone) = await GetTechnicianMetricsAsync(technicianId);

            return new TechnicianProfileDto
            {
                Name = tech.FullName,
                Email = tech.Email,
                Phone = tech.Phone,
                Area = string.IsNullOrEmpty(tech.ServiceArea) ? "Nasr City, Cairo" : tech.ServiceArea,
                Bio = string.IsNullOrEmpty(tech.ShortBio) ? "Professional car care technician with 3+ years of experience." : tech.ShortBio,
                DateOfBirth = tech.DateOfBirth?.ToString("yyyy-MM-dd") ?? "1995-01-01",
                Equipment = tech.VerifiedEquipment ?? new List<string>(),
                VehicleType = string.IsNullOrWhiteSpace(tech.VehicleType) ? "Service Van" : tech.VehicleType,
                VehicleName = string.IsNullOrWhiteSpace(tech.VehicleName) ? "Suzuki Carry 2022" : tech.VehicleName,
                VehiclePlate = string.IsNullOrWhiteSpace(tech.VehiclePlate) ? "س ص ع 4821" : tech.VehiclePlate,
                Rating = rating,
                ReviewCount = reviewCount,
                JobsDone = jobsDone,
                IsVerified = true,
                PhotoPreview = tech.AvatarUrl
            };
        }

        private async Task<(float Rating, int ReviewCount, int JobsDone)> GetTechnicianMetricsAsync(Guid technicianId)
        {
            var jobsDone = await _context.Bookings
                .CountAsync(b => b.TechnicianId == technicianId && b.Status == BookingStatus.COMPLETED);

            var ratings = await _context.Reviews
                .Where(r => r.Booking != null && r.Booking.TechnicianId == technicianId)
                .Select(r => r.AverageRating)
                .ToListAsync();

            var reviewCount = ratings.Count;
            var avgRating = reviewCount > 0 ? MathF.Round(ratings.Average(), 1) : 0f;

            return (avgRating, reviewCount, jobsDone);
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
                if (DateTime.TryParse(dto.DateOfBirth, out var dob))
                {
                    tech.DateOfBirth = dob.Date;
                }
                tech.VehicleType = dto.VehicleType?.Trim() ?? string.Empty;
                tech.VehicleName = dto.VehicleName?.Trim() ?? string.Empty;
                tech.VehiclePlate = dto.VehiclePlate?.Trim() ?? string.Empty;
                if (dto.Equipment != null)
                {
                    tech.VerifiedEquipment = dto.Equipment
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .Select(x => x.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();
                    _context.Entry(tech).Property(t => t.VerifiedEquipment).IsModified = true;
                }
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
                booking.ArrivedAt ??= DateTime.UtcNow;
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

            InspectionUpsell upsell;
            if (booking?.InspectionUpsell != null)
            {
                upsell = booking.InspectionUpsell;
                if (upsell.Status != UpsellStatus.APPROVED)
                {
                    upsell.TechnicianNote = dto.Reason;
                    upsell.AdditionalPrice = dto.AdditionalPrice;
                    upsell.EvidencePhotoUrl = dto.EvidencePhotoUrl ?? string.Empty;
                    upsell.Status = UpsellStatus.PENDING;
                    upsell.RequestedAt = DateTime.UtcNow;
                    upsell.RespondedAt = null;
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                upsell = new InspectionUpsell
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
            var tech = await _context.Technicians
                .Include(t => t.Payouts)
                .Include(t => t.Bookings)
                    .ThenInclude(b => b.Review)
                .FirstOrDefaultAsync(t => t.Id == technicianId);

            if (tech != null)
            {
                var totalEarned = tech.Bookings
                    .Where(b => b.Status == BookingStatus.COMPLETED)
                    .Sum(b => (float)Math.Round(b.TotalPrice * 0.7f, MidpointRounding.AwayFromZero) + (b.Review?.TipAmount ?? 0f));
                var totalCommitted = tech.Payouts
                    .Where(p => IsCommittedPayout(p.Status))
                    .Sum(p => p.Amount);
                tech.TotalBalance = MathF.Max(0f, totalEarned - totalCommitted);

                if (dto.Amount <= 0 || dto.Amount > tech.TotalBalance)
                {
                    return null;
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

        public async Task<IEnumerable<JobOfferDto>> GetJobOffersAsync(Guid technicianId)
        {
            var offers = await _context.JobOffers
                .Include(o => o.Booking)
                    .ThenInclude(b => b.Customer)
                .Include(o => o.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .Include(o => o.Booking)
                    .ThenInclude(b => b.Vehicle)
                .Include(o => o.Booking)
                    .ThenInclude(b => b.BookingAddOns)
                        .ThenInclude(ba => ba.AddOn)
                .Where(o => o.TechnicianId == technicianId
                    && o.Status == JobOfferStatus.OFFERED
                    && o.ExpiresAt > DateTime.UtcNow
                    && o.Booking != null
                    && o.Booking.Status != BookingStatus.CANCELLED
                    && o.Booking.TechnicianId == null)
                .OrderByDescending(o => o.OfferedAt)
                .ToListAsync();

            if (offers.Any())
            {
                return offers.Select(o =>
                {
                    var totalPrice = o.Booking?.TotalPrice ?? 0f;
                    var deposit = o.Booking?.DepositAmount ?? 200f;
                    var payout = o.PayoutAmount > 0 ? o.PayoutAmount : (float)Math.Round(totalPrice * 0.7f, MidpointRounding.AwayFromZero);

                    return new JobOfferDto
                    {
                        Id = o.Id,
                        BookingId = o.BookingId,
                        BookingNumber = o.Booking?.BookingNumber ?? "#BK-OFFER",
                        CustomerName = o.Booking?.Customer?.FullName ?? "New Customer",
                        CustomerAddress = o.Booking?.Address ?? "Nasr City, Cairo",
                        DistanceText = o.Booking?.DistanceText ?? "2.8 km",
                        ServiceName = o.Booking?.ServicePackage?.Name ?? "Premium Wash",
                        VehicleModel = o.Booking?.Vehicle != null ? $"{o.Booking.Vehicle.Make} {o.Booking.Vehicle.Model}" : "Sedan",
                        TotalPrice = totalPrice,
                        BasePackagePrice = o.Booking?.BasePackagePrice > 0 ? o.Booking.BasePackagePrice : (o.Booking?.ServicePackage?.BasePrice ?? totalPrice),
                        AddOnsSubtotal = o.Booking?.AddOnsSubtotal ?? 0f,
                        DistanceSurcharge = o.Booking?.DistanceSurcharge ?? 0f,
                        DepositAmount = deposit,
                        RemainingBalance = MathF.Max(0f, totalPrice - deposit),
                        AddOnNames = o.Booking?.BookingAddOns?.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() ?? new List<string>(),
                        PayoutAmount = payout,
                        OfferedAt = o.OfferedAt,
                        ExpiresAt = o.ExpiresAt,
                        RemainingSeconds = Math.Min(45, Math.Max(1, (int)(o.ExpiresAt - DateTime.UtcNow).TotalSeconds)),
                        Status = o.Status.ToString()
                    };
                });
            }

            return Enumerable.Empty<JobOfferDto>();
        }

        public async Task<JobOfferResponseDto> RespondToJobOfferAsync(Guid technicianId, Guid offerId, bool accept)
        {
            var offer = await _context.JobOffers
                .Include(o => o.Booking)
                    .ThenInclude(b => b.ServicePackage)
                .FirstOrDefaultAsync(o => o.Id == offerId);

            var tech = await _context.Technicians.FirstOrDefaultAsync(t => t.Id == technicianId);

            if (offer == null || tech == null)
            {
                return new JobOfferResponseDto
                {
                    Success = false,
                    Message = "Job offer or technician not found."
                };
            }

            var success = tech.RespondToJobOffer(offer, accept);
            if (!success)
            {
                return new JobOfferResponseDto
                {
                    Success = false,
                    BookingId = offer.BookingId,
                    BookingNumber = offer.Booking?.BookingNumber,
                    Message = "Job offer could not be accepted (expired or already handled)."
                };
            }

            if (accept && offer.Booking != null)
            {
                offer.Booking.TechnicianId = tech.Id;
                offer.Booking.Status = BookingStatus.DISPATCHED;
                offer.Booking.AcceptedAt = DateTime.UtcNow;

                _context.Notifications.Add(new Notification
                {
                    UserId = tech.Id,
                    Title = "Job Accepted",
                    Description = $"You accepted booking {offer.Booking.BookingNumber} ({offer.Booking.ServicePackage?.Name ?? "Car Wash"}).",
                    Type = "CheckCircle2",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return new JobOfferResponseDto
            {
                Success = true,
                BookingId = offer.BookingId,
                BookingNumber = offer.Booking?.BookingNumber,
                Message = accept ? "Job offer accepted and assigned." : "Job offer passed."
            };
        }

        #region Helpers & Default Mock Data

        private static string MapBookingStatusToFrontend(BookingStatus status) => status switch
        {
            BookingStatus.PENDING or BookingStatus.DEPOSIT_PAID => "Upcoming",
            BookingStatus.DISPATCHED => "Upcoming",
            BookingStatus.ON_THE_WAY => "On The Way",
            BookingStatus.ARRIVED => "Arrived",
            BookingStatus.WASHING => "In Progress",
            BookingStatus.COMPLETED => "Completed",
            _ => "Upcoming"
        };

        private static BookingStatus MapFrontendStatusToBookingStatus(string frontendStatus) => frontendStatus.ToLower() switch
        {
            "upcoming" => BookingStatus.DISPATCHED,
            "on the way" => BookingStatus.ON_THE_WAY,
            "arrived" => BookingStatus.ARRIVED,
            "in progress" => BookingStatus.WASHING,
            "completed" => BookingStatus.COMPLETED,
            "cancelled" or "canceled" => BookingStatus.CANCELLED,
            _ => BookingStatus.DISPATCHED
        };

        private static TechnicianJobDto MapToJobDto(Booking b)
        {
            var now = DateTime.UtcNow;
            var remainingSec = b.GetCancelSecondsRemaining(now);

            return new TechnicianJobDto
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
                BasePackagePrice = b.BasePackagePrice > 0 ? b.BasePackagePrice : (b.ServicePackage?.BasePrice ?? b.TotalPrice),
                VehicleMultiplier = b.VehicleMultiplier > 0 ? b.VehicleMultiplier : 1.0f,
                AddOnsSubtotal = b.AddOnsSubtotal,
                DistanceSurcharge = b.DistanceSurcharge,
                UpsellTotal = b.UpsellTotal,
                DepositAmount = b.DepositAmount,
                RemainingBalance = MathF.Max(0f, b.TotalPrice - b.DepositAmount),
                TechPayout = (float)Math.Round(b.TotalPrice * 0.7f, MidpointRounding.AwayFromZero),
                BookingType = b.BookingType.ToString(),
                AddOnNames = b.BookingAddOns?.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() ?? new List<string>(),
                Status = MapBookingStatusToFrontend(b.Status),
                BookingStatus = b.Status.ToString(),
                IsAccepted = b.TechnicianId != null && b.Status != BookingStatus.PENDING && b.Status != BookingStatus.DEPOSIT_PAID && b.Status != BookingStatus.CANCELLED,
                DepositPaid = b.Status != BookingStatus.PENDING && b.Status != BookingStatus.CANCELLED,
                AcceptedAt = b.AcceptedAt,
                CancelDeadlineUtc = b.AcceptedAt?.AddMinutes(Booking.CancellationGraceMinutes),
                CancelSecondsRemaining = remainingSec,
                IsGracePeriodActive = b.Status == BookingStatus.DISPATCHED && remainingSec > 0,
                Address = string.IsNullOrEmpty(b.Address) ? "Cairo, Nasr City" : b.Address,
                Distance = b.DistanceText,
                Latitude = b.ParkingLatitude,
                Longitude = b.ParkingLongitude
            };
        }

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
