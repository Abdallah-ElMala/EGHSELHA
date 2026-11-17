namespace WebCarWash.Application.DTOs.Technician
{
    public class TransactionRowDto
    {
        public string Date { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Customer { get; set; } = string.Empty;
        public float Amount { get; set; }
        public string Status { get; set; } = "Paid";
        public float BookingTotal { get; set; }
    }
}
