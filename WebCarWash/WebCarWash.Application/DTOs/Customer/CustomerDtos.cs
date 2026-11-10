using System;
using System.Collections.Generic;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public string? GateNotes { get; set; }
        public List<string> SavedAddresses { get; set; } = new();
    }

    public class UpdateCustomerProfileDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? GateNotes { get; set; }
    }

    public class AddVehicleDto
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public VehicleSize SizeType { get; set; } = VehicleSize.SEDAN;
        public string? PhotoUrl { get; set; }
    }

    public class CustomerVehicleDto
    {
        public Guid Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string SizeType { get; set; } = "SEDAN";
        public float SizeMultiplier { get; set; } = 1.0f;
        public string? PhotoUrl { get; set; }
    }

    public class CreateCustomerBookingDto
    {
        public Guid VehicleId { get; set; }
        public Guid ServicePackageId { get; set; }
        public Guid ServiceZoneId { get; set; }
        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow.AddHours(2);
        public BookingType BookingType { get; set; } = BookingType.SCHEDULED;
        public ParkingType ParkingType { get; set; } = ParkingType.DRIVEWAY;
        public bool HasElectricity { get; set; } = true;
        public bool HasWaterAccess { get; set; } = true;
        public string Address { get; set; } = string.Empty;
        public float ParkingLatitude { get; set; } = 30.0561f;
        public float ParkingLongitude { get; set; } = 31.3414f;
        public List<Guid> AddOnIds { get; set; } = new();
    }

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

    public class CancelBookingResultDto
    {
        public bool Success { get; set; }
        public bool Deleted { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class PayDepositRequestDto
    {
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CREDIT_CARD;
    }

    public class CustomerPaymentResultDto
    {
        public Guid PaymentId { get; set; }
        public Guid BookingId { get; set; }
        public float Amount { get; set; } = 200f;
        public string PaymentMethod { get; set; } = "CREDIT_CARD";
        public string Status { get; set; } = "SUCCESS";
        public string TransactionRef { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
    }

    public class ApproveUpsellRequestDto
    {
        public bool Decision { get; set; }
    }

    public class SubmitCustomerReviewDto
    {
        public int PunctualityRating { get; set; } = 5;
        public int CleanlinessRating { get; set; } = 5;
        public int ProfessionalismRating { get; set; } = 5;
        public List<string> SelectedTags { get; set; } = new();
        public float TipAmount { get; set; } = 0f;
        public string? CommentText { get; set; }
    }

    public class CustomerReviewResultDto
    {
        public Guid ReviewId { get; set; }
        public Guid BookingId { get; set; }
        public float AverageRating { get; set; }
        public int LoyaltyPointsEarned { get; set; } = 50;
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }

    public class CustomerReviewItemDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public float AverageRating { get; set; }
        public int PunctualityRating { get; set; }
        public int CleanlinessRating { get; set; }
        public int ProfessionalismRating { get; set; }
        public List<string> SelectedTags { get; set; } = new();
        public float TipAmount { get; set; }
        public string CommentText { get; set; } = string.Empty;
        public DateTime ReviewedAt { get; set; }
        public int LoyaltyPointsEarned { get; set; } = 50;
    }

    public class FileCustomerDisputeDto
    {
        public string Reason { get; set; } = string.Empty;
        public List<string> EvidenceUrls { get; set; } = new();
    }

    public class CustomerDisputeResultDto
    {
        public Guid DisputeId { get; set; }
        public Guid BookingId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "OPEN";
        public DateTime FiledAt { get; set; }
    }

    public class DeleteAddressDto
    {
        public string Address { get; set; } = string.Empty;
    }

    public class WalletTopUpDto
    {
        public float Amount { get; set; } = 500f;
    }

    public class CustomerCatalogDto
    {
        public List<CustomerCatalogPackageDto> Packages { get; set; } = new();
        public List<CustomerCatalogAddOnDto> AddOns { get; set; } = new();
        public List<CustomerCatalogZoneDto> Zones { get; set; } = new();
    }

    public class CustomerCatalogPackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
    }

    public class CustomerCatalogAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class CustomerCatalogZoneDto
    {
        public Guid Id { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public float BaseDistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; }
    }
}
