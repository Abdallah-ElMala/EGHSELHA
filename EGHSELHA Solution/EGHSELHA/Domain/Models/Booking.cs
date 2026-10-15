using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{

    public class Booking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string BookingNumber { get; set; } = string.Empty;
        public BookingStatus Status { get; set; } = BookingStatus.PENDING;
        public BookingType BookingType { get; set; }
        public DateTime ScheduledAt { get; set; }
        public float ParkingLatitude { get; set; }
        public float ParkingLongitude { get; set; }
        public ParkingType ParkingType { get; set; }
        public bool HasElectricity { get; set; }
        public bool HasWaterAccess { get; set; }
        public float BasePackagePrice { get; set; }
        public float VehicleMultiplier { get; set; } = 1.0f;
        public float AddOnsSubtotal { get; set; }
        public float DistanceSurcharge { get; set; }
        public float PeakSurgeMultiplier { get; set; } = 1.0f;
        public float UpsellTotal { get; set; }
        public float TotalPrice { get; set; }
        public float DepositAmount { get; set; } = 200f;
        public float RemainingBalance { get; set; }

        public Guid CustomerId { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid VehicleId { get; set; }
        public Guid ServicePackageId { get; set; }
        public Guid ServiceZoneId { get; set; }

        public Customer Customer { get; set; } = null!;
        public Technician? Technician { get; set; }
        public Vehicle Vehicle { get; set; } = null!;
        public ServicePackage ServicePackage { get; set; } = null!;
        public ServiceZone ServiceZone { get; set; } = null!;

        public ICollection<BookingAddOn> BookingAddOns { get; set; } = new List<BookingAddOn>();
        public ICollection<JobOffer> JobOffers { get; set; } = new List<JobOffer>();
        public InspectionUpsell? InspectionUpsell { get; set; }
        public ICollection<PhotoQA> PhotoQAs { get; set; } = new List<PhotoQA>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public Invoice? Invoice { get; set; }
        public Review? Review { get; set; }
        public Dispute? Dispute { get; set; }

        public float CalculateFinalPrice()
        {
            TotalPrice = (BasePackagePrice * VehicleMultiplier)
                       + AddOnsSubtotal
                       + (DistanceSurcharge * PeakSurgeMultiplier)
                       + UpsellTotal;
            RemainingBalance = TotalPrice - DepositAmount;
            return TotalPrice;
        }

        public bool ValidateEligibility() =>
            ServiceZone?.Status == ZoneStatus.ACTIVE &&
            (ServicePackage?.IsEligible(HasElectricity, HasWaterAccess,
                ParkingType is ParkingType.PRIVATE_GARAGE or ParkingType.DRIVEWAY) ?? true);

        public JobOffer DispatchToNearestTech() => new()
        {
            BookingId = Id,
            Status = JobOfferStatus.OFFERED,
            OfferedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddSeconds(45)
        };

        public bool CancelBooking(string reason)
        {
            if (Status == BookingStatus.COMPLETED) return false;
            Status = BookingStatus.CANCELLED;
            return true;
        }
    }
}