using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Enums
{
    public enum BookingStatus
    {
        PENDING = 1,
        DEPOSIT_PAID = 2,
        DISPATCHED = 3,
        ARRIVED = 4,
        WASHING = 5,
        COMPLETED = 6,
        CANCELLED = 7
    }
}
