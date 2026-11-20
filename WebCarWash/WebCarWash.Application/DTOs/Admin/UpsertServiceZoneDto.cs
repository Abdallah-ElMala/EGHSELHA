using System.ComponentModel.DataAnnotations;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Admin
{
    public class UpsertServiceZoneDto
    {
        [Required(ErrorMessage = "Zone name is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Zone name must be between 3 and 100 characters.")]
        public string ZoneName { get; set; } = string.Empty;

        [EnumDataType(typeof(ZoneStatus), ErrorMessage = "Invalid zone status.")]
        public ZoneStatus Status { get; set; } = ZoneStatus.ACTIVE;

        [Range(0.0, 500.0, ErrorMessage = "Base distance surcharge must be between 0 and 500 EGP.")]
        public float BaseDistanceSurcharge { get; set; } = 20f;

        [Range(1.0, 5.0, ErrorMessage = "Peak surge multiplier must be between 1.0 and 5.0.")]
        public float PeakSurgeMultiplier { get; set; } = 1.0f;

        [Range(1, 100, ErrorMessage = "Max technicians must be between 1 and 100.")]
        public int MaxTechnicians { get; set; } = 10;
    }
}
