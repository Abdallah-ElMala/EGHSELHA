using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class InspectionUpsell
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public string TechnicianNote { get; set; } = string.Empty;
        public string EvidencePhotoUrl { get; set; } = string.Empty;
        public float AdditionalPrice { get; set; }
        public UpsellStatus Status { get; set; } = UpsellStatus.PENDING;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }

        public Booking Booking { get; set; } = null!;

        public void Approve() { Status = UpsellStatus.APPROVED; RespondedAt = DateTime.UtcNow; }
        public void Decline() { Status = UpsellStatus.DECLINED; RespondedAt = DateTime.UtcNow; }
    }
}
