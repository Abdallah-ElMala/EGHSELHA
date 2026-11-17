using System;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerDisputeResultDto
    {
        public Guid DisputeId { get; set; }
        public Guid BookingId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "OPEN";
        public DateTime FiledAt { get; set; }
    }
}
