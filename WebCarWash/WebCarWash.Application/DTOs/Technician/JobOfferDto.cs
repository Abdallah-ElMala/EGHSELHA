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
        public float TotalPrice { get; set; }
        public float BasePackagePrice { get; set; }
        public float AddOnsSubtotal { get; set; }
        public float DistanceSurcharge { get; set; }
        public float DepositAmount { get; set; } = 200f;
        public float RemainingBalance { get; set; }
        public List<string> AddOnNames { get; set; } = new();
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

    public class JobOfferResponseDto
    {
        public bool Success { get; set; }
        public Guid? BookingId { get; set; }
        public string? BookingNumber { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateLocationDto
    {
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }
}
