using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Auth
{
    public class GoogleLoginDto
    {
        [Required(ErrorMessage = "Google ID Token مطلوب.")]
        public string IdToken { get; set; } = string.Empty;

        public string Role { get; set; } = "CUSTOMER";
    }
}
