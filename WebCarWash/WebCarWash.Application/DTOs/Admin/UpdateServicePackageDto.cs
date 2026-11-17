namespace WebCarWash.Application.DTOs.Admin
{
    public class UpdateServicePackageDto
    {
        public string? Name { get; set; }
        public float BasePrice { get; set; }
        public int DurationMinutes { get; set; }
        public bool RequiresElectricity { get; set; }
        public bool RequiresWater { get; set; }
        public bool RequiresPrivateParking { get; set; }
    }
}
