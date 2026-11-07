using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class RequestPayoutDto
    {
        public float Amount { get; set; }
        public string PayoutMethod { get; set; } = "Instapay"; // Instapay, Vodafone Cash, Bank Transfer
        public string AccountDetails { get; set; } = string.Empty;
    }

    public class PayoutDto
    {
        public Guid Id { get; set; }
        public float Amount { get; set; }
        public string PayoutMethod { get; set; } = string.Empty;
        public string AccountDetails { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime RequestedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }
}
