using System;
using System.Security.Claims;
using WebCarWash.Application.DTOs.Auth;

namespace WebCarWash.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        (string Token, DateTime ExpiresAt) GenerateToken(AuthUserDto user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
