using System;
using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class CustomerReviewItemDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public float AverageRating { get; set; }
        public int PunctualityRating { get; set; }
        public int CleanlinessRating { get; set; }
        public int ProfessionalismRating { get; set; }
        public List<string> SelectedTags { get; set; } = new();
        public float TipAmount { get; set; }
        public string CommentText { get; set; } = string.Empty;
        public DateTime ReviewedAt { get; set; }
        public int LoyaltyPointsEarned { get; set; } = 50;
    }
}
