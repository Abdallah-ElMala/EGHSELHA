using System;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerCatalogAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
