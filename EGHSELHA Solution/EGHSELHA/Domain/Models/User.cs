using EGHSELHA.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGHSELHA.Domain.Models
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

        public virtual bool Login(string phone, string password) => Phone == phone && PasswordHash == password;
        public virtual bool VerifyOTP(string code) => IsPhoneVerified = !string.IsNullOrWhiteSpace(code);
        public virtual void ResetPassword(string newPassword) => PasswordHash = newPassword;
    }
}