using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Admin
{
    public class UpdateAddOnDto
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Add-on name must be between 2 and 100 characters.")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        [Range(10.0, 5000.0, ErrorMessage = "Price must be between 10 and 5,000 EGP.")]
        public float Price { get; set; }

        public bool IsActive { get; set; }
    }
}
