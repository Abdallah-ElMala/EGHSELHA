using System.Collections.Generic;

namespace WebCarWash.Application.DTOs.Customer
{
    public class FileCustomerDisputeDto
    {
        public string Reason { get; set; } = string.Empty;
        public List<string> EvidenceUrls { get; set; } = new();
    }
}
