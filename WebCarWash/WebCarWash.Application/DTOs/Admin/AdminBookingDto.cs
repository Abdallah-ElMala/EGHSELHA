using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminBookingDto
    {
        public Guid Id { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string BookingType { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public string Address { get; set; } = string.Empty;
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public Guid? TechnicianId { get; set; }
        public string? TechnicianName { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public float BasePackagePrice { get; set; }
        public float VehicleMultiplier { get; set; }
        public float AddOnsSubtotal { get; set; }
        public float DistanceSurcharge { get; set; }
        public float UpsellTotal { get; set; }
        public float TotalPrice { get; set; }
        public float DepositAmount { get; set; }
        public float RemainingBalance { get; set; }
        public List<string> AddOnNames { get; set; } = new();
        public string? CancelledBy { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? OnTheWayAt { get; set; }
        public DateTime? ArrivedAt { get; set; }
        public DateTime? WashingStartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? TravelDurationMinutes { get; set; }
        public int? WorkDurationMinutes { get; set; }
        public int? TotalTripMinutes { get; set; }
        public float ParkingLatitude { get; set; }
        public float ParkingLongitude { get; set; }
        public string DistanceText { get; set; } = string.Empty;
        public List<AdminBookingPhotoDto> Photos { get; set; } = new();
    }
}
