using System;

namespace WebCarWash.Application.DTOs.Admin
{
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
}
