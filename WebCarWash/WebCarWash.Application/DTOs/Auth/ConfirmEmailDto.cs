using System.ComponentModel.DataAnnotations;

namespace WebCarWash.Application.DTOs.Auth
{
    public class ConfirmEmailDto
    {
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب.")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "رمز تأكيد البريد مطلوب.")]
        public string Token { get; set; } = string.Empty;
    }
}
