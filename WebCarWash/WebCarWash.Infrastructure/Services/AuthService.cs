using System;
using System.Threading.Tasks;
using AutoMapper;
using WebCarWash.Application.DTOs.Auth;
using WebCarWash.Application.Interfaces;
using WebCarWash.Application.Interfaces.Repositories;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;
using WebCarWash.Infrastructure.Security;

namespace WebCarWash.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IMapper _mapper;

        public AuthService(IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _jwtTokenGenerator = jwtTokenGenerator;
            _mapper = mapper;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return new AuthResponseDto { Success = false, Message = "Email and password are required." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null || !PasswordHasher.Verify(dto.Password, user.PasswordHash))
            {
                return new AuthResponseDto { Success = false, Message = "Invalid email or password." };
            }

            if (user is Admin admin)
            {
                admin.LastLogin = DateTime.UtcNow;
                _unitOfWork.Admins.Update(admin);
                await _unitOfWork.CompleteAsync();
            }

            var userDto = _mapper.Map<AuthUserDto>(user);
            var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(userDto);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                ExpiresAt = expiresAt,
                User = userDto
            };
        }

        public async Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
            {
                return new AuthResponseDto { Success = false, Message = "Full name, email, and password are required." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var emailExists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (emailExists)
            {
                return new AuthResponseDto { Success = false, Message = "An account with this email already exists." };
            }

            // استخدام AutoMapper لتحويل DTO -> Customer
            var customer = _mapper.Map<Customer>(dto);
            customer.Email = normalizedEmail;
            customer.PasswordHash = PasswordHasher.Hash(dto.Password);
            customer.CreatedAt = DateTime.UtcNow;

            await _unitOfWork.Customers.AddAsync(customer);
            await _unitOfWork.CompleteAsync();

            var customerDto = _mapper.Map<AuthUserDto>(customer);
            var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(customerDto);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Customer registered successfully.",
                Token = token,
                ExpiresAt = expiresAt,
                User = _mapper.Map<AuthUserDto>(customer)
            };
        }

        public async Task<AuthResponseDto> RegisterTechnicianAsync(RegisterTechnicianDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.FullName))
            {
                return new AuthResponseDto { Success = false, Message = "Full name, email, and password are required." };
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var emailExists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (emailExists)
            {
                return new AuthResponseDto { Success = false, Message = "An account with this email already exists." };
            }

            // ربط الفني بأول منطقة خدمة فعالة
            var zone = await _unitOfWork.ServiceZones.FirstOrDefaultAsync(z => z.Status == ZoneStatus.ACTIVE);

            // استخدام AutoMapper لتحويل DTO -> Technician
            var technician = _mapper.Map<Technician>(dto);
            technician.Email = normalizedEmail;
            technician.PasswordHash = PasswordHasher.Hash(dto.Password);
            technician.CreatedAt = DateTime.UtcNow;
            technician.ServiceZoneId = zone?.Id;

            await _unitOfWork.Technicians.AddAsync(technician);
            await _unitOfWork.CompleteAsync();

            var technicianDto = _mapper.Map<AuthUserDto>(technician);
            var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(technicianDto);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Technician registered successfully.",
                Token = token,
                ExpiresAt = expiresAt,
                User = technicianDto
            };
        }

        public async Task<AuthUserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            return user == null ? null : _mapper.Map<AuthUserDto>(user);
        }
    }
}
