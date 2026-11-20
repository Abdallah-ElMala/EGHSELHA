using System;

namespace WebCarWash.Application.DTOs.Auth
{
    public class AuthUserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool TwoFactorEnabled { get; set; }
        public bool IsEmailConfirmed { get; set; }
    }
}
