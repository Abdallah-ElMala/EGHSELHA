using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? DateOfBirth { get; set; }
        public List<string> Equipment { get; set; } = new();
        public string VehicleType { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string VehiclePlate { get; set; } = string.Empty;
        public float Rating { get; set; }
        public int ReviewCount { get; set; }
        public int JobsDone { get; set; }
        public bool IsVerified { get; set; } = true;
        public string? PhotoPreview { get; set; }
    }
}
