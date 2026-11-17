using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerBookingDto
    {
        public Guid Id { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING";
        public string BookingType { get; set; } = "SCHEDULED";
        public DateTime ScheduledAt { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public float TotalPrice { get; set; }
        public float BasePackagePrice { get; set; }
        public float VehicleMultiplier { get; set; } = 1.0f;
        public float AddOnsSubtotal { get; set; }
        public float DistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; } = 1.0f;
        public float UpsellTotal { get; set; }
        public float DepositAmount { get; set; } = 200f;
        public float RemainingBalance { get; set; }
        public List<string> AddOnNames { get; set; } = new();
        public string? TechnicianName { get; set; }
        public string? TechnicianPhone { get; set; }
        public float? TechnicianLatitude { get; set; }
        public float? TechnicianLongitude { get; set; }
        public bool HasPendingUpsell { get; set; }
        public float? PendingUpsellPrice { get; set; }
        public Guid? PendingUpsellId { get; set; }
        public string? PendingUpsellReason { get; set; }
        public bool HasReview { get; set; }
        public bool HasDispute { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CancelDeadlineUtc { get; set; }
        public bool CanCancel { get; set; }
        public int CancelSecondsRemaining { get; set; }
        public bool IsLockedIn { get; set; }
    }
}
