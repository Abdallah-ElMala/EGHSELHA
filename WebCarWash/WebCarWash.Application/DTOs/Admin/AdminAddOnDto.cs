using System;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminAddOnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
