using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
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

        public Guid? ServiceZoneId { get; set; }
        public ServiceZone? ServiceZone { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<JobOffer> JobOffers { get; set; } = new List<JobOffer>();
        public ICollection<Payout> Payouts { get; set; } = new List<Payout>();
        public TechnicianApplication? TechnicianApplication { get; set; }

        public Technician() => Role = UserRole.TECHNICIAN;

        public void ToggleAvailability(bool isOnline) => IsOnline = isOnline;
        public void UpdateGPSLocation(float lat, float lng) { CurrentLatitude = lat; CurrentLongitude = lng; }
        public bool RespondToJobOffer(Guid offerId, bool decision) => decision;
        public void MarkArrived(Guid bookingId) { }
        public PhotoQA UploadQAPhoto(PhotoQA photoData) => photoData;

        public InspectionUpsell ProposeUpsell(Guid bookingId, string reason, float price) => new()
        {
            BookingId = bookingId,
            TechnicianNote = reason,
            AdditionalPrice = price,
            Status = UpsellStatus.PENDING,
            RequestedAt = DateTime.UtcNow
        };

        public void MarkCompleted(Guid bookingId) { }

        public Payout RequestPayout(string method, float amount) => new()
        {
            TechnicianId = Id,
            PayoutMethod = method,
            Amount = amount,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };
    }
}
