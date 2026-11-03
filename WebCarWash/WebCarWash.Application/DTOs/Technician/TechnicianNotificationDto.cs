using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianNotificationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string IconType { get; set; } = "BriefcaseBusiness";
        public bool IsUnread { get; set; } = false;
    }
}
