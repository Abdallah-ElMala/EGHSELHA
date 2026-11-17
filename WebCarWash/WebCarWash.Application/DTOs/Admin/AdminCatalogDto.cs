using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminCatalogDto
    {
        public List<AdminServicePackageDto> Packages { get; set; } = new();
        public List<AdminAddOnDto> AddOns { get; set; } = new();
        public List<AdminServiceZoneDto> Zones { get; set; } = new();
    }
}
