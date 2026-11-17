using System;

namespace WebCarWash.Application.DTOs.Admin
{
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
}
