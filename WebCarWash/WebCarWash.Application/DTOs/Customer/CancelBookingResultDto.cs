namespace WebCarWash.Application.DTOs.Customer
{
    public class CancelBookingResultDto
    {
        public bool Success { get; set; }
        public bool Deleted { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
