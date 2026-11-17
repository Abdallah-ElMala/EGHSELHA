namespace WebCarWash.Application.DTOs.Auth
{
    public class RegisterTechnicianDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string ServiceArea { get; set; } = "Nasr City, Cairo";
    }
}
