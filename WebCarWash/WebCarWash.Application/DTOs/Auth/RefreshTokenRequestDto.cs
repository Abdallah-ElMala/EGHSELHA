using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "رمز الوصول (Access Token) مطلوب.")]
        public string AccessToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "رمز التحديث (Refresh Token) مطلوب.")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
