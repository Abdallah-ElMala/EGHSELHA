using System;

namespace WebCarWash.Application.DTOs.Admin
{
    public class AdminBookingPhotoDto
    {
        public Guid Id { get; set; }
        public string PhotoType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public float GpsLatitude { get; set; }
        public float GpsLongitude { get; set; }
    }
}
