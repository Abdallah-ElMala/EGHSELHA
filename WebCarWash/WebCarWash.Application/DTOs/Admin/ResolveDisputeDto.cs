namespace WebCarWash.Application.DTOs.Admin
{
    public class ResolveDisputeDto
    {
        public string Action { get; set; } = "UNDER_REVIEW"; // REFUNDED, REWASH_DISPATCHED, REJECTED, UNDER_REVIEW
        public string? AdminNotes { get; set; }
    }
}
