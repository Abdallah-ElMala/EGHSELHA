using System;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Technician
{
    public class ProposeUpsellDto
    {
        public string Reason { get; set; } = string.Empty;
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
