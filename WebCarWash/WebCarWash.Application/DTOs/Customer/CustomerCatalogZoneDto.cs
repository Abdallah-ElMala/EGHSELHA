using System;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerCatalogZoneDto
    {
        public Guid Id { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public float BaseDistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; }
    }
}
