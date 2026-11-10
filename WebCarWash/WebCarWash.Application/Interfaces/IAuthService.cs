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
    }
}
