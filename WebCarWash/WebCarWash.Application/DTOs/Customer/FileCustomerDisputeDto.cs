using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class FileCustomerDisputeDto
    {
        [Required(ErrorMessage = "Dispute reason is required.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Dispute reason must be between 5 and 200 characters.")]
        public string Reason { get; set; } = string.Empty;

        public List<string> EvidenceUrls { get; set; } = new();
    }
}
