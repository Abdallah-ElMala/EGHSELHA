
using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public float Amount { get; set; }
        public PaymentType PaymentType { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;
        public string TransactionRef { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }

        public Booking Booking { get; set; } = null!;

        public bool ProcessTransaction() { Status = PaymentStatus.SUCCESS; PaidAt = DateTime.UtcNow; return true; }
        public bool Refund() { Status = PaymentStatus.REFUNDED; return true; }
    }
}
