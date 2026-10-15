using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class AddOn
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<BookingAddOn> BookingAddOns { get; set; } = new List<BookingAddOn>();

        public float GetPrice() => Price;
        public void ToggleActive(bool status) => IsActive = status;
    }
}