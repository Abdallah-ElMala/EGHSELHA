using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminCustomerVehicleDto
    {
        public Guid Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string SizeType { get; set; } = string.Empty;
    }

    public class AdminCustomerDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? GateNotes { get; set; }
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public int VehiclesCount { get; set; }
        public int BookingsCount { get; set; }
        public int DisputesCount { get; set; }
        public float TotalSpent { get; set; }
        public List<string> SavedAddresses { get; set; } = new();
        public List<AdminCustomerVehicleDto> Vehicles { get; set; } = new();
    }
}
