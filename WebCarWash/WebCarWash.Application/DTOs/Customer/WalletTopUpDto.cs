using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class WalletTopUpDto
    {
        [Required(ErrorMessage = "Top-up amount is required.")]
        [Range(10.0, 50000.0, ErrorMessage = "Top-up amount must be between 10 EGP and 50,000 EGP.")]
        public float Amount { get; set; } = 500f;
    }
}
