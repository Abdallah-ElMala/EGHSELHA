using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class AddVehicleDto
    {
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Color { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public VehicleSize SizeType { get; set; } = VehicleSize.SEDAN;
        public string? PhotoUrl { get; set; }
    }
}
