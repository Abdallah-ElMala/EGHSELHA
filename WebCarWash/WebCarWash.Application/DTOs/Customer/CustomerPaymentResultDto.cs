using System;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerPaymentResultDto
    {
        public Guid PaymentId { get; set; }
        public Guid BookingId { get; set; }
        public float Amount { get; set; } = 200f;
        public string PaymentMethod { get; set; } = "CREDIT_CARD";
        public string Status { get; set; } = "SUCCESS";
        public string TransactionRef { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
    }
}
