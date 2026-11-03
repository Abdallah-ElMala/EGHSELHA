using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Domain.Entities
{
    public class Payout
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TechnicianId { get; set; }
        public float Amount { get; set; }
        public string PayoutMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }

        public Technician Technician { get; set; } = null!;

        public bool ApproveTransfer() { Status = "Processed"; ProcessedAt = DateTime.UtcNow; return true; }
        public void CancelPayout() { Status = "Cancelled"; ProcessedAt = DateTime.UtcNow; }
    }
}
