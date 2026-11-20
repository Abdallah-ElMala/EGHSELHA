using System;
using System.Threading.Tasks;
using WebCarWash.Application.DTOs.Auth;

namespace WebCarWash.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto);
        Task<AuthResponseDto> RegisterTechnicianAsync(RegisterTechnicianDto dto);
        Task<AuthUserDto?> GetUserByIdAsync(Guid userId);
        
        // Refresh Token Flow
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
        Task<bool> RevokeRefreshTokenAsync(string? refreshToken, Guid? userId = null);
        
        // Two-Factor Authentication (2FA)
        Task<AuthResponseDto> VerifyTwoFactorAsync(VerifyTwoFactorDto dto);
        Task<bool> ToggleTwoFactorAsync(Guid userId);
        
        // Email Confirmation & Password Reset
        Task<bool> SendEmailConfirmationAsync(string email);
        Task<bool> ConfirmEmailAsync(ConfirmEmailDto dto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        
        // Google External Login
        Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto);
    }
}
