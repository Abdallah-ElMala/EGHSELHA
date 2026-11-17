using System;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerReviewResultDto
    {
        public Guid ReviewId { get; set; }
        public Guid BookingId { get; set; }
        public float AverageRating { get; set; }
        public int LoyaltyPointsEarned { get; set; } = 50;
        public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    }
}
