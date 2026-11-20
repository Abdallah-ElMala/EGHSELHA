using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Admin
{
    public class UpdateServicePackageDto
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Package name must be between 2 and 100 characters.")]
        public string? Name { get; set; }

        [Range(50.0, 10000.0, ErrorMessage = "Base price must be between 50 and 10,000 EGP.")]
        public float BasePrice { get; set; }

        [Range(15, 360, ErrorMessage = "Duration must be between 15 and 360 minutes.")]
        public int DurationMinutes { get; set; }

        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
    }
}
