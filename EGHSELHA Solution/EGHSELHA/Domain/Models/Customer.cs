using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Customer : User
    {
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public List<string> SavedAddresses { get; set; } = new();

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

        public Customer() => Role = UserRole.CUSTOMER;

        public Vehicle AddVehicle(Vehicle vehicleData)
        {
            vehicleData.CustomerId = Id;
            Vehicles.Add(vehicleData);
            return vehicleData;
        }

        public Booking CreateBooking(Booking booking)
        {
            booking.CustomerId = Id;
            Bookings.Add(booking);
            return booking;
        }

        public Payment PayDeposit(Guid bookingId) => new()
        {
            BookingId = bookingId,
            Amount = 200f,
            PaymentType = PaymentType.DEPOSIT,
            Status = PaymentStatus.SUCCESS,
            PaidAt = DateTime.UtcNow
        };

        public bool ApproveUpsell(Guid upsellId, bool decision) => decision;

        public Review SubmitReview(Guid bookingId, int rating) => new()
        {
            BookingId = bookingId,
            CustomerId = Id,
            AverageRating = rating
        };

        public Dispute FileDispute(Guid bookingId, string reason) => new()
        {
            BookingId = bookingId,
            CustomerId = Id,
            Reason = reason,
            Status = DisputeStatus.OPEN,
            FiledAt = DateTime.UtcNow
        };
    }
}
