using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class DeleteAddressDto
    {
        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; } = string.Empty;
    }
}
