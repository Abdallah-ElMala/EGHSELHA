using WebCarWash.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WebCarWash.Domain.Entities
{
    public class Customer : User
    {
        public float WalletBalance { get; set; }
        public int LoyaltyPoints { get; set; }
        public string? GateNotes { get; set; }
        public List<string> SavedAddresses { get; set; } = new();

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

        public Customer() => Role = UserRole.CUSTOMER;

        public Vehicle AddVehicle(Vehicle vehicleData)
        {
            vehicleData.CustomerId = Id;
            vehicleData.GetSizeMultiplier();
            Vehicles.Add(vehicleData);
            return vehicleData;
        }

        public Booking CreateBooking(Booking booking)
        {
            booking.CustomerId = Id;
            booking.Status = BookingStatus.PENDING;
            booking.CalculateFinalPrice();
            Bookings.Add(booking);
            return booking;
        }

        public Payment PayDeposit(Booking booking, PaymentMethod method = PaymentMethod.CREDIT_CARD)
        {
            if (booking.CustomerId != Id)
            {
                throw new InvalidOperationException("Booking does not belong to this customer.");
            }

            var payment = new Payment
            {
                BookingId = booking.Id,
                Amount = 200f,
                PaymentType = PaymentType.DEPOSIT,
                PaymentMethod = method,
                Status = PaymentStatus.SUCCESS,
                TransactionRef = $"TXN-DEP-{Guid.NewGuid().ToString()[..8].ToUpper()}",
                PaidAt = DateTime.UtcNow
            };

            booking.Status = BookingStatus.DEPOSIT_PAID;
            booking.Payments.Add(payment);
            return payment;
        }

        public Payment PayDeposit(Guid bookingId)
        {
            var booking = Bookings.FirstOrDefault(b => b.Id == bookingId);
            return booking != null ? PayDeposit(booking) : new Payment
            {
                BookingId = bookingId,
                Amount = 200f,
                PaymentType = PaymentType.DEPOSIT,
                Status = PaymentStatus.SUCCESS,
                PaidAt = DateTime.UtcNow
            };
        }

        public bool ApproveUpsell(InspectionUpsell upsell, bool decision)
        {
            if (upsell == null) return false;
            if (decision)
            {
                upsell.Approve();
                if (upsell.Booking != null)
                {
                    upsell.Booking.UpsellTotal += upsell.AdditionalPrice;
                    upsell.Booking.CalculateFinalPrice();
                }
            }
            else
            {
                upsell.Decline();
            }
            return decision;
        }

        public bool ApproveUpsell(Guid upsellId, bool decision) => decision;

        public Review SubmitReview(Booking booking, int punctuality, int cleanliness, int professionalism, List<string>? tags = null, float tip = 0f, string? comment = null)
        {
            if (booking.CustomerId != Id)
            {
                throw new InvalidOperationException("Booking does not belong to this customer.");
            }

            var review = new Review
            {
                BookingId = booking.Id,
                CustomerId = Id,
                PunctualityRating = punctuality,
                CleanlinessRating = cleanliness,
                ProfessionalismRating = professionalism,
                SelectedTags = tags ?? new(),
                TipAmount = tip,
                CommentText = comment
            };

            review.CalculateAverage();
            Reviews.Add(review);
            booking.Review = review;

            // Reward loyalty points
            LoyaltyPoints += 50;

            if (tip > 0 && booking.Technician != null)
            {
                booking.Technician.TodayEarnings += tip;
                booking.Technician.TotalBalance += tip;
            }

            return review;
        }

        public Review SubmitReview(Guid bookingId, int rating) => new()
        {
            BookingId = bookingId,
            CustomerId = Id,
            AverageRating = rating
        };

        public Dispute FileDispute(Booking booking, string reason, List<string>? evidenceUrls = null)
        {
            if (booking.CustomerId != Id)
            {
                throw new InvalidOperationException("Booking does not belong to this customer.");
            }

            var dispute = new Dispute
            {
                BookingId = booking.Id,
                CustomerId = Id,
                Reason = reason,
                EvidenceUrls = evidenceUrls ?? new(),
                Status = DisputeStatus.OPEN,
                FiledAt = DateTime.UtcNow
            };

            Disputes.Add(dispute);
            booking.Dispute = dispute;
            return dispute;
        }

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
