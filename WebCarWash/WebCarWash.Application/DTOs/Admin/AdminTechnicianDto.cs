using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminTechnicianDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string ServiceArea { get; set; } = string.Empty;
        public string ShortBio { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleName { get; set; }
        public string? VehiclePlate { get; set; }
        public string VanLevel { get; set; } = string.Empty;
        public string WorkingDays { get; set; } = string.Empty;
        public string WorkingHours { get; set; } = string.Empty;
        public List<string> VerifiedEquipment { get; set; } = new();
        public bool IsOnline { get; set; }
        public float Rating { get; set; }
        public float AcceptanceRate { get; set; }
        public float TodayEarnings { get; set; }
        public float TotalBalance { get; set; }
        public float TotalRevenue { get; set; }
        public int CompletedJobsCount { get; set; }
        public int ActiveJobsCount { get; set; }
        public string ApplicationStatus { get; set; } = "Approved";
        public bool HasPressureWasher { get; set; }
        public bool HasVacuumExtractor { get; set; }
        public bool HasWaterTankGenerator { get; set; }
        public bool HasVehicle { get; set; }
    }
}
