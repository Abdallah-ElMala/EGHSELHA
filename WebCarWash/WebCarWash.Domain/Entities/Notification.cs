using System;

namespace WebCarWash.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Type { get; set; } = "General";
        public bool IsRead { get; set; } = false;

        public User? User { get; set; }
    }
}
