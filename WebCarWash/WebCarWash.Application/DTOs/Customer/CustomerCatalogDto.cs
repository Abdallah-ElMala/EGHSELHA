using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerCatalogDto
    {
        public List<CustomerCatalogPackageDto> Packages { get; set; } = new();
        public List<CustomerCatalogAddOnDto> AddOns { get; set; } = new();
        public List<CustomerCatalogZoneDto> Zones { get; set; } = new();
    }
}
