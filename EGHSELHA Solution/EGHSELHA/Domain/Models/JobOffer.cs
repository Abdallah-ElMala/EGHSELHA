using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class JobOffer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public Guid TechnicianId { get; set; }
        public JobOfferStatus Status { get; set; } = JobOfferStatus.OFFERED;
        public float PayoutAmount { get; set; }
        public DateTime OfferedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }

        public Booking Booking { get; set; } = null!;
        public Technician Technician { get; set; } = null!;

        public bool Accept()
        {
            if (DateTime.UtcNow > ExpiresAt) return false;
            Status = JobOfferStatus.ACCEPTED;
            return true;
        }

        public void Pass() => Status = JobOfferStatus.PASSED;
        public void Expire() => Status = JobOfferStatus.EXPIRED;
    }
}
