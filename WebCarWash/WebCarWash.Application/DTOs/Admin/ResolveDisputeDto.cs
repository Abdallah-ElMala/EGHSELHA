using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Admin
{
    public class ResolveDisputeDto
    {
        [Required(ErrorMessage = "Action is required.")]
        public string Action { get; set; } = "UNDER_REVIEW"; // REFUNDED, REWASH_DISPATCHED, REJECTED, UNDER_REVIEW

        [StringLength(500, ErrorMessage = "Admin notes cannot exceed 500 characters.")]
        public string? AdminNotes { get; set; }
    }
}
