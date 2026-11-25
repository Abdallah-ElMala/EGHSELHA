using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CreateCustomerBookingDto
    {
        [Required(ErrorMessage = "Vehicle selection is required.")]
        public Guid VehicleId { get; set; }

        [Required(ErrorMessage = "Service package selection is required.")]
        public Guid ServicePackageId { get; set; }

        [Required(ErrorMessage = "Service zone selection is required.")]
        public Guid ServiceZoneId { get; set; }

        [Required(ErrorMessage = "Scheduled date and time is required.")]
        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow.AddHours(2);

        [EnumDataType(typeof(BookingType), ErrorMessage = "Invalid booking type.")]
        public BookingType BookingType { get; set; } = BookingType.SCHEDULED;

        [EnumDataType(typeof(ParkingType), ErrorMessage = "Invalid parking type.")]
        public ParkingType ParkingType { get; set; } = ParkingType.DRIVEWAY;

        public bool HasElectricity { get; set; } = true;

        public bool HasWaterAccess { get; set; } = true;

        [Required(ErrorMessage = "Wash location address is required.")]
        [StringLength(250, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 250 characters.")]
        public string Address { get; set; } = string.Empty;

        [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90.")]
        public float ParkingLatitude { get; set; } = 30.0226f;

        [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180.")]
        public float ParkingLongitude { get; set; } = 31.0031f;

        public List<Guid> AddOnIds { get; set; } = new();
    }
}
