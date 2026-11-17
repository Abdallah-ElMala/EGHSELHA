using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Admin
{
    public class UpsertServiceZoneDto
    {
        public string ZoneName { get; set; } = string.Empty;
        public ZoneStatus Status { get; set; } = ZoneStatus.ACTIVE;
        public float BaseDistanceSurcharge { get; set; } = 20f;
        public float PeakSurgeMultiplier { get; set; } = 1.0f;
        public int MaxTechnicians { get; set; } = 10;
    }
}
