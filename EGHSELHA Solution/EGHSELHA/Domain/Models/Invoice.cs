using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Invoice
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string InvoiceNumber { get; set; } = string.Empty;
        public Guid BookingId { get; set; }
        public float Subtotal { get; set; }
        public float AddOnsTotal { get; set; }
        public float DistanceFee { get; set; }
        public float DepositPaid { get; set; }
        public float FinalPaid { get; set; }
        public float TotalAmount { get; set; }
        public float VatAmount { get; set; }
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        public Booking Booking { get; set; } = null!;

        public byte[] GeneratePDF() => Array.Empty<byte>();
        public bool SendEmailReceipt() => true;
    }
}
