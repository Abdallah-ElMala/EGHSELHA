using AutoMapper;
using WebCarWash.Application.DTOs.Auth;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.Common.Mappings
{
    public class AuthMappingProfile : Profile
    {
        public AuthMappingProfile()
        {
            // User -> AuthUserDto
            CreateMap<User, AuthUserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            // RegisterCustomerDto -> Customer
            CreateMap<RegisterCustomerDto, Customer>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(_ => UserRole.CUSTOMER))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // سيتم عمل Hash لكلمة المرور في الـ Service

            // RegisterTechnicianDto -> Technician
            CreateMap<RegisterTechnicianDto, Technician>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(_ => UserRole.TECHNICIAN))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.WorkingDays, opt => opt.MapFrom(_ => "Sunday – Thursday"))
                .ForMember(dest => dest.WorkingHours, opt => opt.MapFrom(_ => "09:00 AM – 06:00 PM"))
                .ForMember(dest => dest.IsOnline, opt => opt.MapFrom(_ => true));
        }
    }
}
