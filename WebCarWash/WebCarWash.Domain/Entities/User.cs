using WebCarWash.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebCarWash.Domain.Entities
{

    public abstract class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsPhoneVerified { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Refresh Token for JWT Security
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Email Confirmation
        public bool IsEmailConfirmed { get; set; }
        public string? EmailConfirmationToken { get; set; }

        // Password Reset
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetExpiry { get; set; }

        // Two-Factor Authentication (2FA)
        public bool TwoFactorEnabled { get; set; }
        public string? TwoFactorCode { get; set; }
        public DateTime? TwoFactorExpiry { get; set; }

        // External Login (Google OAuth)
        public string? GoogleSubjectId { get; set; }

        public virtual bool Login(string phone, string password) => Phone == phone && PasswordHash == password;
        public virtual bool VerifyOTP(string code) => IsPhoneVerified = !string.IsNullOrWhiteSpace(code);
        public virtual void ResetPassword(string newPassword) => PasswordHash = newPassword;
    }
}