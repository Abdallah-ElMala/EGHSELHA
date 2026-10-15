using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;

namespace EGHSELHA.Domain.Models
{

    public class BookingAddOn
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public Guid AddOnId { get; set; }
        public float PriceAtBooking { get; set; }

        public Booking Booking { get; set; } = null!;
        public AddOn AddOn { get; set; } = null!;
    }
}