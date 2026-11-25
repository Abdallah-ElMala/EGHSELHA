using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminDisputeDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string BookingStatus { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string? TechnicianName { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public float TotalPrice { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? AdminNotes { get; set; }
        public DateTime FiledAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public int PhotoQACount { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? OnTheWayAt { get; set; }
        public DateTime? ArrivedAt { get; set; }
        public DateTime? WashingStartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? TravelDurationMinutes { get; set; }
        public int? WorkDurationMinutes { get; set; }
        public int ExpectedDurationMinutes { get; set; }
        public bool IsDelayed { get; set; }
        public int DelayMinutes { get; set; }
        public string DelaySummary { get; set; } = "On time";
        public List<string> EvidenceUrls { get; set; } = new();
        public List<AdminBookingPhotoDto> Photos { get; set; } = new();
    }
}
