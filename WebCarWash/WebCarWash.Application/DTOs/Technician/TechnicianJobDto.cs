using System;

namespace WebCarWash.Application.DTOs.Technician
{
    public class TechnicianJobDto
    {
        public string Id { get; set; } = string.Empty;
        public string BookingNumber { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Car { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public float Price { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Distance { get; set; } = "3.2 km";
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }

    public class UpdateJobStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
