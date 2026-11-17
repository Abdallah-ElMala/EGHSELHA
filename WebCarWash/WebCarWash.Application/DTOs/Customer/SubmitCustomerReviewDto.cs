using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class SubmitCustomerReviewDto
    {
        public int PunctualityRating { get; set; } = 5;
        public int CleanlinessRating { get; set; } = 5;
        public int ProfessionalismRating { get; set; } = 5;
        public List<string> SelectedTags { get; set; } = new();
        public float TipAmount { get; set; } = 0f;
        public string? CommentText { get; set; }
    }
}
