using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Customer
{
    public class SubmitCustomerReviewDto
    {
        [Range(1, 5, ErrorMessage = "Punctuality rating must be between 1 and 5 stars.")]
        public int PunctualityRating { get; set; } = 5;

        [Range(1, 5, ErrorMessage = "Cleanliness rating must be between 1 and 5 stars.")]
        public int CleanlinessRating { get; set; } = 5;

        [Range(1, 5, ErrorMessage = "Professionalism rating must be between 1 and 5 stars.")]
        public int ProfessionalismRating { get; set; } = 5;

        public List<string> SelectedTags { get; set; } = new();

        [Range(0.0, 5000.0, ErrorMessage = "Tip amount must be between 0 and 5,000 EGP.")]
        public float TipAmount { get; set; } = 0f;

        [StringLength(1000, ErrorMessage = "Feedback comment cannot exceed 1000 characters.")]
        public string? CommentText { get; set; }
    }
}
