using System;
using System.ComponentModel.DataAnnotations;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Technician
{
    public class ProposeUpsellDto
    {
        [Required(ErrorMessage = "Reason for upsell inspection proposal is required.")]
        [StringLength(300, MinimumLength = 5, ErrorMessage = "Reason must be between 5 and 300 characters.")]
        public string Reason { get; set; } = string.Empty;

        [Range(10.0, 5000.0, ErrorMessage = "Additional price must be between 10 EGP and 5,000 EGP.")]
        public float AdditionalPrice { get; set; }

        public string EvidencePhotoUrl { get; set; } = string.Empty;
    }

    public class InspectionUpsellDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string TechnicianNote { get; set; } = string.Empty;
        public string EvidencePhotoUrl { get; set; } = string.Empty;
        public float AdditionalPrice { get; set; }
        public string Status { get; set; } = "PENDING";
        public DateTime RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}
