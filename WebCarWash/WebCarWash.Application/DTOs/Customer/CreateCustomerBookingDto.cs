using System;
using System.Collections.Generic;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CreateCustomerBookingDto
    {
        public Guid VehicleId { get; set; }
        public Guid ServicePackageId { get; set; }
        public Guid ServiceZoneId { get; set; }
        public DateTime ScheduledAt { get; set; } = DateTime.UtcNow.AddHours(2);
        public BookingType BookingType { get; set; } = BookingType.SCHEDULED;
        public ParkingType ParkingType { get; set; } = ParkingType.DRIVEWAY;
        public bool HasElectricity { get; set; } = true;
        public bool HasWaterAccess { get; set; } = true;
        public string Address { get; set; } = string.Empty;
        public float ParkingLatitude { get; set; } = 30.0561f;
        public float ParkingLongitude { get; set; } = 31.3414f;
        public List<Guid> AddOnIds { get; set; } = new();
    }
}
