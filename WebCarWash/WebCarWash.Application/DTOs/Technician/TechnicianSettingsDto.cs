using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianSettingsDto
    {
        public bool Available { get; set; } = true;
        public string WorkingDays { get; set; } = "Sunday – Thursday";
        public string WorkingHours { get; set; } = "09:00 AM – 06:00 PM";
        public bool Push { get; set; } = true;
        public bool Sms { get; set; } = false;
        public bool Email { get; set; } = true;
    }
}
