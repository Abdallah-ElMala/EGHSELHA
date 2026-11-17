namespace WebCarWash.Application.DTOs.Technician
{
    public class NextCustomerDto
    {
        public string Customer { get; set; } = string.Empty;
        public string Car { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Eta { get; set; } = "12 min";
        public string Distance { get; set; } = "3.2 km";
        public string Address { get; set; } = string.Empty;
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }
}
