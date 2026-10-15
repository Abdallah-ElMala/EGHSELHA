using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Vehicle
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public VehicleSize SizeType { get; set; }
        public float SizeMultiplier { get; set; } = 1.0f;
        public string? PhotoUrl { get; set; }

        public Customer Customer { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        public float GetSizeMultiplier() => SizeMultiplier = SizeType switch
        {
            VehicleSize.SEDAN => 1.0f,
            VehicleSize.SUV => 1.25f,
            VehicleSize.TRUCK_VAN => 1.50f,
            _ => 1.0f
        };
    }
}
