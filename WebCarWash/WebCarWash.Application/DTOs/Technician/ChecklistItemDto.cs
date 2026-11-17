namespace WebCarWash.Application.DTOs.Technician
{
    public class ChecklistItemDto
    {
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = "Done"; // "Done" or "Pending"
    }
}
