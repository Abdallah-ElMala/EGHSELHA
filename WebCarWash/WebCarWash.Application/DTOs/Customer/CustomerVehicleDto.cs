using System;

namespace WebCarWash.Application.DTOs.Customer
{
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
}
