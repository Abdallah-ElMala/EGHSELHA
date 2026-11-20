using System;
using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Technician
{
    public class RequestPayoutDto
    {
        [Required(ErrorMessage = "Payout amount is required.")]
        [Range(50.0, 50000.0, ErrorMessage = "Payout amount must be between 50 EGP and 50,000 EGP.")]
        public float Amount { get; set; }

        [Required(ErrorMessage = "Payout method is required.")]
        public string PayoutMethod { get; set; } = "Instapay"; // Instapay, Vodafone Cash, Bank Transfer

        [Required(ErrorMessage = "Account details (e.g. Instapay IPA, mobile number, or IBAN) are required.")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Account details must be between 5 and 100 characters.")]
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
