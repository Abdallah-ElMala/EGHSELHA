using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EGHSELHA.Domain.Enums;

namespace EGHSELHA.Domain.Models
{
    public class PhotoQA
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public PhotoType PhotoType { get; set; }
        public PhotoCategory Category { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public float GpsLatitude { get; set; }
        public float GpsLongitude { get; set; }
        public bool IsVerified { get; set; }

        public Booking Booking { get; set; } = null!;

        public bool ValidateLocation() => IsVerified = true;
        public object GetInspectionRecord() => new { Id, BookingId, PhotoType, Category, ImageUrl, Timestamp, IsVerified };
    }
}
