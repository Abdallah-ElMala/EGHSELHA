namespace WebCarWash.Application.DTOs.Admin
{
    public class UpdateAddOnDto
    {
        public string? Name { get; set; }
        public float Price { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}
