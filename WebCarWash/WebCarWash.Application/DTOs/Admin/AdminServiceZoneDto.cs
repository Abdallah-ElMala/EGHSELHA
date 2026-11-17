using System;

namespace WebCarWash.Application.DTOs.Admin
{
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
}
