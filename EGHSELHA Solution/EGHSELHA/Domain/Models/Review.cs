using EGHSELHA.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
{
    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public Guid CustomerId { get; set; }
        public int PunctualityRating { get; set; }
        public int CleanlinessRating { get; set; }
        public int ProfessionalismRating { get; set; }
        public float AverageRating { get; set; }
        public List<string> SelectedTags { get; set; } = new();
        public float TipAmount { get; set; }
        public string? CommentText { get; set; }

        public Booking Booking { get; set; } = null!;
        public Customer Customer { get; set; } = null!;

        public float CalculateAverage() =>
            AverageRating = (PunctualityRating + CleanlinessRating + ProfessionalismRating) / 3.0f;
    }
}
