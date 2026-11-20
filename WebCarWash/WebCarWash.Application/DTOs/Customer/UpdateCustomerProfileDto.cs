using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class UpdateCustomerProfileDto
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters.")]
        public string? FullName { get; set; }

        [RegularExpression(@"^(\+20|0020|0)?1[0125][0-9]{8}$", ErrorMessage = "Please enter a valid Egyptian mobile number (e.g. 01012345678 or +201012345678).")]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string? Email { get; set; }

        [StringLength(500, ErrorMessage = "Gate notes cannot exceed 500 characters.")]
        public string? GateNotes { get; set; }
    }
}
