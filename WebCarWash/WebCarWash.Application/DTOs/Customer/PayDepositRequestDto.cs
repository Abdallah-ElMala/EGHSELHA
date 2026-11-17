using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class PayDepositRequestDto
    {
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CREDIT_CARD;
    }
}
