using System;
using System.Collections.Generic;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public float TotalRevenue { get; set; }
        public float PlatformCommission { get; set; }
        public float TechnicianPayoutsTotal { get; set; }
        public int TotalBookings { get; set; }
        public int ActiveBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalTechnicians { get; set; }
        public int OnlineTechnicians { get; set; }
        public int OpenDisputes { get; set; }
        public int PendingPayoutsCount { get; set; }
        public float PendingPayoutsAmount { get; set; }
        public int PendingApplicationsCount { get; set; }
        public List<StatusCountDto> StatusBreakdown { get; set; } = new();
        public List<PackageRevenueDto> RevenueByPackage { get; set; } = new();
        public List<AdminBookingDto> RecentBookings { get; set; } = new();
    }

    public class StatusCountDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class PackageRevenueDto
    {
        public string PackageName { get; set; } = string.Empty;
        public int BookingsCount { get; set; }
        public float Revenue { get; set; }
    }

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

    public class AdminBookingPhotoDto
    {
        public Guid Id { get; set; }
        public string PhotoType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public float GpsLatitude { get; set; }
        public float GpsLongitude { get; set; }
    }

    public class AssignTechnicianDto
    {
        public Guid TechnicianId { get; set; }
    }

    public class AdminUpdateBookingStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class AdminTechnicianDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ServiceArea { get; set; } = string.Empty;
        public bool IsOnline { get; set; }
        public float Rating { get; set; }
        public float AcceptanceRate { get; set; }
        public float TodayEarnings { get; set; }
        public float TotalBalance { get; set; }
        public int CompletedJobsCount { get; set; }
        public int ActiveJobsCount { get; set; }
        public string ApplicationStatus { get; set; } = "Approved";
        public bool HasPressureWasher { get; set; }
        public bool HasVacuumExtractor { get; set; }
        public bool HasWaterTankGenerator { get; set; }
        public bool HasVehicle { get; set; }
    }

    public class ReviewTechApplicationDto
    {
        public string Decision { get; set; } = "Approved";
    }

    public class AdminCustomerDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public int VehiclesCount { get; set; }
        public int BookingsCount { get; set; }
        public float TotalSpent { get; set; }
        public List<string> SavedAddresses { get; set; } = new();
    }

    public class AdminCatalogDto
    {
        public List<AdminServicePackageDto> Packages { get; set; } = new();
        public List<AdminAddOnDto> AddOns { get; set; } = new();
        public List<AdminServiceZoneDto> Zones { get; set; } = new();
    }

    public class AdminServicePackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
    }

    public class UpdateServicePackageDto
    {
        public string? Name { get; set; }
        public float BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
    }

    public class AdminAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UpdateAddOnDto
    {
        public string? Name { get; set; }
        public float Price { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class AdminServiceZoneDto
    {
        public Guid Id { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE";
        public float BaseDistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; }
        public int MaxTechnicians { get; set; }
        public int BookingsCount { get; set; }
        public int TechniciansCount { get; set; }
    }

    public class UpsertServiceZoneDto
    {
        public string ZoneName { get; set; } = string.Empty;
        public ZoneStatus Status { get; set; } = ZoneStatus.ACTIVE;
        public float BaseDistanceSurcharge { get; set; } = 20f;
        public float PeakSurgeMultiplier { get; set; } = 1.0f;
        public int MaxTechnicians { get; set; } = 10;
    }

    public class AdminDisputeDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
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

    public class ResolveDisputeDto
    {
        public string Action { get; set; } = "UNDER_REVIEW"; // REFUNDED, REWASH_DISPATCHED, REJECTED, UNDER_REVIEW
        public string? AdminNotes { get; set; }
    }

    public class AdminPayoutDto
    {
        public Guid Id { get; set; }
        public Guid TechnicianId { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public float Amount { get; set; }
        public string PayoutMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }

    public class ProcessPayoutDto
    {
        public bool Approve { get; set; }
    }
}
