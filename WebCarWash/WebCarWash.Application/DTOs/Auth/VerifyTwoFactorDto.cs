using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Auth
{
    public class VerifyTwoFactorDto
    {
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب.")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "رمز التحقق بخطوتين (2FA) مطلوب.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "رمز التحقق يجب أن يتكون من 6 أرقام.")]
        public string Code { get; set; } = string.Empty;
    }
}
