using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianCustomerVehicleDto
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string SizeType { get; set; } = string.Empty;
    }

    public class TechnicianJobDto
    {
        public string Id { get; set; } = string.Empty;
        public string BookingNumber { get; set; } = string.Empty;
        public Guid CustomerId { get; set; }
        public string Customer { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string? CustomerGateNotes { get; set; }
        public int CustomerTotalBookings { get; set; }
        public List<string> CustomerSavedAddresses { get; set; } = new();
        public List<TechnicianCustomerVehicleDto> CustomerVehicles { get; set; } = new();
        public string Service { get; set; } = string.Empty;
        public string Car { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string CarColor { get; set; } = string.Empty;
        public int CarYear { get; set; }
        public string CarSizeType { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Distance { get; set; } = "3.2 km";
        public float Latitude { get; set; }
        public float Longitude { get; set; }

        public float BasePackagePrice { get; set; }
        public float VehicleMultiplier { get; set; } = 1.0f;
        public float AddOnsSubtotal { get; set; }
        public float DistanceSurcharge { get; set; }
        public float UpsellTotal { get; set; }
        public float DepositAmount { get; set; }
        public float RemainingBalance { get; set; }
        public float TechPayout { get; set; }
        public string BookingType { get; set; } = string.Empty;
        public List<string> AddOnNames { get; set; } = new();
        public string BookingStatus { get; set; } = string.Empty;
        public bool IsAccepted { get; set; }
        public bool DepositPaid { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CancelDeadlineUtc { get; set; }
        public int CancelSecondsRemaining { get; set; }
        public bool IsGracePeriodActive { get; set; }
    }
}
