using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class AddAddressDto
    {
        [Required(ErrorMessage = "العنوان مطلوب.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "العنوان يجب أن يكون بين 5 و 200 حرف.")]
        public string Address { get; set; } = string.Empty;
    }
}
