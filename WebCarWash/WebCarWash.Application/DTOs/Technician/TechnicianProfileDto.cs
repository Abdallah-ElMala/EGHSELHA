using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public float Rating { get; set; } = 4.9f;
        public int ReviewCount { get; set; } = 128;
        public int JobsDone { get; set; } = 246;
        public bool IsVerified { get; set; } = true;
        public string? PhotoPreview { get; set; }
    }
}
