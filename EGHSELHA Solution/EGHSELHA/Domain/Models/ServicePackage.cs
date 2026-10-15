using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class ServicePackage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public float BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
        public bool RequiresCustomerReturn { get; set; }
        public List<string> IncludedServices { get; set; } = new();

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();

        public bool IsEligible(bool elec, bool water, bool parking) =>
            (!RequiresElectricity || elec) && (!RequiresWater || water) && (!RequiresPrivateParking || parking);
    }
}
