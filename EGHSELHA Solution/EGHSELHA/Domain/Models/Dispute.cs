using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{

    public class Dispute
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid? AdminId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DisputeStatus Status { get; set; } = DisputeStatus.OPEN;
        public List<string> EvidenceUrls { get; set; } = new();
        public string? AdminNotes { get; set; }
        public DateTime FiledAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }

        public Booking Booking { get; set; } = null!;
        public Customer Customer { get; set; } = null!;
        public Admin? Admin { get; set; }

        public void IssueRefund() { Status = DisputeStatus.REFUNDED; ResolvedAt = DateTime.UtcNow; }
        public void DispatchRewash() { Status = DisputeStatus.REWASH_DISPATCHED; ResolvedAt = DateTime.UtcNow; }
        public void RejectDispute(string note) { Status = DisputeStatus.REJECTED; AdminNotes = note; ResolvedAt = DateTime.UtcNow; }
    }
}