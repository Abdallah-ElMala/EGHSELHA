namespace WebCarWash.Application.DTOs.Technician
{
    public class DailyBarStatDto
    {
        public string Day { get; set; } = string.Empty;
        public int Percentage { get; set; }
        public string DateLabel { get; set; } = string.Empty;
        public float Amount { get; set; }
    }
}
