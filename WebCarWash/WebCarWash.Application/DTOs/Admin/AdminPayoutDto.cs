using System;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminPayoutDto
    {
        public Guid Id { get; set; }
        public Guid TechnicianId { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public float Amount { get; set; }
        public string PayoutMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }
}
