using AutoMapper;
using WebCarWash.Application.DTOs.Customer;
using WebCarWash.Domain.Entities;

namespace WebCarWash.Application.Common.Mappings
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            // 1. Customer <-> CustomerProfileDto
            CreateMap<Customer, CustomerProfileDto>();

            // 2. Vehicle <-> CustomerVehicleDto / AddVehicleDto
            CreateMap<Vehicle, CustomerVehicleDto>()
                .ForMember(dest => dest.SizeType, opt => opt.MapFrom(src => src.SizeType.ToString()));

            CreateMap<AddVehicleDto, Vehicle>()
                .ForMember(dest => dest.SizeMultiplier, opt => opt.MapFrom(src => 1.0f));

            // 3. ServicePackage -> CustomerCatalogPackageDto
            CreateMap<ServicePackage, CustomerCatalogPackageDto>();

            // 4. AddOn -> CustomerCatalogAddOnDto
            CreateMap<AddOn, CustomerCatalogAddOnDto>();

            // 5. ServiceZone -> CustomerCatalogZoneDto
            CreateMap<ServiceZone, CustomerCatalogZoneDto>();

            // 6. Booking -> CustomerBookingDto
            CreateMap<Booking, CustomerBookingDto>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServicePackage != null ? src.ServicePackage.Name : string.Empty))
                .ForMember(dest => dest.VehicleName, opt => opt.MapFrom(src => src.Vehicle != null ? $"{src.Vehicle.Make} {src.Vehicle.Model}" : string.Empty))
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.Vehicle != null ? src.Vehicle.LicensePlate : string.Empty))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BookingType, opt => opt.MapFrom(src => src.BookingType.ToString()))
                .ForMember(dest => dest.TechnicianName, opt => opt.MapFrom(src => src.Technician != null ? src.Technician.FullName : null))
                .ForMember(dest => dest.TechnicianPhone, opt => opt.MapFrom(src => src.Technician != null ? src.Technician.Phone : null))
                .ForMember(dest => dest.TechnicianLatitude, opt => opt.MapFrom(src => src.Technician != null ? (float?)src.Technician.CurrentLatitude : null))
                .ForMember(dest => dest.TechnicianLongitude, opt => opt.MapFrom(src => src.Technician != null ? (float?)src.Technician.CurrentLongitude : null));
        }
    }
}
