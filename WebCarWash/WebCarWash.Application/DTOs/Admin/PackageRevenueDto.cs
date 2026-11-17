namespace WebCarWash.Application.DTOs.Admin
{
    public class PackageRevenueDto
    {
        public string PackageName { get; set; } = string.Empty;
        public int BookingsCount { get; set; }
        public float Revenue { get; set; }
    }
}
