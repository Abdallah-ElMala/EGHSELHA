using WebCarWash.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WebCarWash.Domain.Entities
{
    public class Technician : User
    {
        public string NationalId { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
        public float CurrentLatitude { get; set; }
        public float CurrentLongitude { get; set; }
        public float Rating { get; set; }
        public float AcceptanceRate { get; set; }
        public float TodayEarnings { get; set; }
        public float TotalBalance { get; set; }
        public string VanLevel { get; set; } = string.Empty;
        public List<string> VerifiedEquipment { get; set; } = new();

        public string ServiceArea { get; set; } = string.Empty;
        public string ShortBio { get; set; } = string.Empty;
        public string WorkingDays { get; set; } = "Sunday – Thursday";
        public string WorkingHours { get; set; } = "09:00 AM – 06:00 PM";
        public bool PushNotificationsEnabled { get; set; } = true;
        public bool SmsNotificationsEnabled { get; set; } = false;
        public bool EmailNotificationsEnabled { get; set; } = true;
        public string? AvatarUrl { get; set; }

        public Guid? ServiceZoneId { get; set; }
        public ServiceZone? ServiceZone { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<JobOffer> JobOffers { get; set; } = new List<JobOffer>();
        public ICollection<Payout> Payouts { get; set; } = new List<Payout>();
        public TechnicianApplication? TechnicianApplication { get; set; }

        public Technician() => Role = UserRole.TECHNICIAN;

        public void ToggleAvailability(bool isOnline) => IsOnline = isOnline;

        public void UpdateGPSLocation(float lat, float lng)
        {
            CurrentLatitude = lat;
            CurrentLongitude = lng;
        }

        public bool RespondToJobOffer(JobOffer offer, bool decision)
        {
            if (offer == null) return false;
            if (decision)
            {
                var accepted = offer.Accept();
                if (accepted && offer.Booking != null)
                {
                    offer.Booking.TechnicianId = Id;
                    offer.Booking.Status = BookingStatus.DISPATCHED;
                }
                return accepted;
            }
            else
            {
                offer.Pass();
                return true;
            }
        }

        public bool RespondToJobOffer(Guid offerId, bool decision)
        {
            var offer = JobOffers.FirstOrDefault(o => o.Id == offerId);
            return offer != null ? RespondToJobOffer(offer, decision) : decision;
        }

        public void MarkArrived(Booking booking)
        {
            if (booking != null && booking.TechnicianId == Id)
            {
                booking.Status = BookingStatus.ARRIVED;
            }
        }

        public void MarkArrived(Guid bookingId)
        {
            var booking = Bookings.FirstOrDefault(b => b.Id == bookingId);
            if (booking != null) MarkArrived(booking);
        }

        public PhotoQA UploadQAPhoto(PhotoQA photoData)
        {
            photoData.ValidateLocation();
            return photoData;
        }

        public InspectionUpsell ProposeUpsell(Booking booking, string reason, float price, string photoUrl = "")
        {
            var upsell = new InspectionUpsell
            {
                BookingId = booking.Id,
                TechnicianNote = reason,
                AdditionalPrice = price,
                EvidencePhotoUrl = photoUrl,
                Status = UpsellStatus.PENDING,
                RequestedAt = DateTime.UtcNow
            };
            booking.InspectionUpsell = upsell;
            return upsell;
        }

        public InspectionUpsell ProposeUpsell(Guid bookingId, string reason, float price) => new()
        {
            BookingId = bookingId,
            TechnicianNote = reason,
            AdditionalPrice = price,
            Status = UpsellStatus.PENDING,
            RequestedAt = DateTime.UtcNow
        };

        public void MarkCompleted(Booking booking)
        {
            if (booking != null && booking.TechnicianId == Id)
            {
                booking.Status = BookingStatus.COMPLETED;
                var techEarnings = booking.TotalPrice * 0.7f;
                TodayEarnings += techEarnings;
                TotalBalance += techEarnings;
            }
        }

        public void MarkCompleted(Guid bookingId)
        {
            var booking = Bookings.FirstOrDefault(b => b.Id == bookingId);
            if (booking != null) MarkCompleted(booking);
        }

        public Payout RequestPayout(string method, float amount, string accountDetails = "")
        {
            if (amount <= 0 || amount > TotalBalance)
            {
                throw new InvalidOperationException("Invalid payout amount or insufficient balance.");
            }

            TotalBalance -= amount;

            var payout = new Payout
            {
                TechnicianId = Id,
                PayoutMethod = method,
                Amount = amount,
                AccountDetails = accountDetails,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            Payouts.Add(payout);
            return payout;
        }
    }
}
