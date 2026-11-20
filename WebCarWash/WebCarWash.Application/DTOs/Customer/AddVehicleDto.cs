using System.ComponentModel.DataAnnotations;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class AddVehicleDto
    {
        [Required(ErrorMessage = "Car make (manufacturer) is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Make must be between 2 and 50 characters.")]
        public string Make { get; set; } = string.Empty;

        [Required(ErrorMessage = "Car model is required.")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "Model must be between 1 and 50 characters.")]
        public string Model { get; set; } = string.Empty;

        [Range(1950, 2030, ErrorMessage = "Manufacturing year must be between 1950 and 2030.")]
        public int Year { get; set; }

        [Required(ErrorMessage = "Car color is required.")]
        [StringLength(30, MinimumLength = 2, ErrorMessage = "Color must be between 2 and 30 characters.")]
        public string Color { get; set; } = string.Empty;

        [Required(ErrorMessage = "License plate number is required.")]
        [StringLength(20, MinimumLength = 2, ErrorMessage = "License plate must be between 2 and 20 characters.")]
        [RegularExpression(@"^[\u0600-\u06FFa-zA-Z0-9\s\-]{2,20}$", ErrorMessage = "License plate may only contain letters, numbers, spaces, or hyphens.")]
        public string LicensePlate { get; set; } = string.Empty;

        [EnumDataType(typeof(VehicleSize), ErrorMessage = "Invalid vehicle size type.")]
        public VehicleSize SizeType { get; set; } = VehicleSize.SEDAN;

        [Url(ErrorMessage = "Photo URL must be a valid URL.")]
        public string? PhotoUrl { get; set; }
    }
}
