using System;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Technician
{
    public class UploadQAPhotoDto
    {
        public PhotoType PhotoType { get; set; } // BEFORE or AFTER
        public PhotoCategory Category { get; set; } // FRONT, BACK, INTERIOR, REAR_SEATS, TRUNK
        public string ImageUrl { get; set; } = string.Empty;
        public float GpsLatitude { get; set; }
        public float GpsLongitude { get; set; }
    }

    public class PhotoQADto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string PhotoType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public float GpsLatitude { get; set; }
        public float GpsLongitude { get; set; }
        public bool IsVerified { get; set; }
    }
}
