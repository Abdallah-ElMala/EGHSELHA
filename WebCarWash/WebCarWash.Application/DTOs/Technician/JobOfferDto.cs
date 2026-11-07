using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class JobOfferDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public string DistanceText { get; set; } = "3.2 km";
        public float PayoutAmount { get; set; }
        public DateTime OfferedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int RemainingSeconds { get; set; }
        public string Status { get; set; } = "OFFERED";
    }

    public class RespondJobOfferDto
    {
        public bool Accept { get; set; }
    }

    public class UpdateLocationDto
    {
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }
}
