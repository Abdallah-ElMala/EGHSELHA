using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebCarWash.Application.DTOs.Auth;
using WebCarWash.Application.Interfaces;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Data;
using WebCarWash.Infrastructure.Security;

namespace WebCarWash.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly CarWashDbContext _context;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(CarWashDbContext context, IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return new AuthResponseDto { Success = false, Message = "Email and password are required." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null || !PasswordHasher.Verify(dto.Password, user.PasswordHash))
            {
                return new AuthResponseDto { Success = false, Message = "Invalid email or password." };
            }

            if (user is Admin admin)
            {
                admin.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return BuildSuccessResponse(user, "Signed in successfully.");
        }

        public async Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Phone) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return new AuthResponseDto { Success = false, Message = "All registration fields are required." };
            }

            if (dto.Password.Length < 6)
            {
                return new AuthResponseDto { Success = false, Message = "Password must be at least 6 characters." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                return new AuthResponseDto { Success = false, Message = "An account with this email already exists." };
            }

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                Phone = dto.Phone.Trim(),
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = UserRole.CUSTOMER,
                IsPhoneVerified = true,
                WalletBalance = 0f,
                LoyaltyPoints = 0
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return BuildSuccessResponse(customer, "Customer account created successfully.");
        }

        public async Task<AuthResponseDto> RegisterTechnicianAsync(RegisterTechnicianDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Phone) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return new AuthResponseDto { Success = false, Message = "All registration fields are required." };
            }

            if (dto.Password.Length < 6)
            {
                return new AuthResponseDto { Success = false, Message = "Password must be at least 6 characters." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            {
                return new AuthResponseDto { Success = false, Message = "An account with this email already exists." };
            }

            var defaultZone = await _context.ServiceZones.FirstOrDefaultAsync();

            var technician = new Technician
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                Phone = dto.Phone.Trim(),
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = UserRole.TECHNICIAN,
                NationalId = dto.NationalId?.Trim() ?? string.Empty,
                ServiceArea = string.IsNullOrWhiteSpace(dto.ServiceArea) ? "Nasr City, Cairo" : dto.ServiceArea.Trim(),
                WorkingDays = "Sunday – Thursday",
                WorkingHours = "09:00 AM – 06:00 PM",
                IsOnline = false,
                ServiceZoneId = defaultZone?.Id
            };

            _context.Technicians.Add(technician);
            _context.TechnicianApplications.Add(new TechnicianApplication
            {
                TechnicianId = technician.Id,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            return BuildSuccessResponse(technician, "Technician application created successfully.");
        }

        public async Task<AuthUserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            return user == null ? null : MapUser(user);
        }

        private AuthResponseDto BuildSuccessResponse(User user, string message)
        {
            var userDto = MapUser(user);
            var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(userDto);
            return new AuthResponseDto
            {
                Success = true,
                Message = message,
                Token = token,
                ExpiresAt = expiresAt,
                User = userDto
            };
        }

        private static AuthUserDto MapUser(User user) => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString()
        };
    }
}
