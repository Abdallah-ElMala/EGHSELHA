using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using WebCarWash.Application.DTOs.Admin;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.Common.Mappings
{
    public class AdminMappingProfile : Profile
    {
        public AdminMappingProfile()
        {
            // 1. ServicePackage
            CreateMap<ServicePackage, AdminServicePackageDto>();
            CreateMap<UpdateServicePackageDto, ServicePackage>();

            // 2. AddOn
            CreateMap<AddOn, AdminAddOnDto>();
            CreateMap<UpdateAddOnDto, AddOn>();

            // 3. ServiceZone
            CreateMap<ServiceZone, AdminServiceZoneDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BookingsCount, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Count : 0))
                .ForMember(dest => dest.TechniciansCount, opt => opt.MapFrom(src => src.Technicians != null ? src.Technicians.Count : 0));

            // 4. PhotoQA -> AdminBookingPhotoDto
            CreateMap<PhotoQA, AdminBookingPhotoDto>()
                .ForMember(dest => dest.PhotoType, opt => opt.MapFrom(src => src.PhotoType.ToString()))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));

            // 5. Booking -> AdminBookingDto
            CreateMap<Booking, AdminBookingDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BookingType, opt => opt.MapFrom(src => src.BookingType.ToString()))
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : "Customer"))
                .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Phone : string.Empty))
                .ForMember(dest => dest.TechnicianName, opt => opt.MapFrom(src => src.Technician != null ? src.Technician.FullName : null))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.ServicePackage != null ? src.ServicePackage.Name : "Car Wash"))
                .ForMember(dest => dest.VehicleName, opt => opt.MapFrom(src => src.Vehicle != null ? $"{src.Vehicle.Make} {src.Vehicle.Model}" : "Sedan"))
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.Vehicle != null ? src.Vehicle.LicensePlate : string.Empty))
                .ForMember(dest => dest.BasePackagePrice, opt => opt.MapFrom(src => src.BasePackagePrice > 0 ? src.BasePackagePrice : (src.ServicePackage != null ? src.ServicePackage.BasePrice : src.TotalPrice)))
                .ForMember(dest => dest.VehicleMultiplier, opt => opt.MapFrom(src => src.VehicleMultiplier > 0 ? src.VehicleMultiplier : 1.0f))
                .ForMember(dest => dest.RemainingBalance, opt => opt.MapFrom(src => MathF.Max(0f, src.TotalPrice - src.DepositAmount)))
                .ForMember(dest => dest.AddOnNames, opt => opt.MapFrom(src => src.BookingAddOns != null ? src.BookingAddOns.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() : new List<string>()))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.PhotoQAs != null ? src.PhotoQAs.OrderBy(p => p.Timestamp) : Enumerable.Empty<PhotoQA>()));

            // 6. Technician -> AdminTechnicianDto
            CreateMap<Technician, AdminTechnicianDto>()
                .ForMember(dest => dest.ServiceArea, opt => opt.MapFrom(src => string.IsNullOrWhiteSpace(src.ServiceArea) ? "Cairo" : src.ServiceArea))
                .ForMember(dest => dest.VerifiedEquipment, opt => opt.MapFrom(src => src.VerifiedEquipment ?? new List<string>()))
                .ForMember(dest => dest.CompletedJobsCount, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Count(b => b.Status == BookingStatus.COMPLETED) : 0))
                .ForMember(dest => dest.ActiveJobsCount, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Count(b => b.Status != BookingStatus.COMPLETED && b.Status != BookingStatus.CANCELLED) : 0))
                .ForMember(dest => dest.TotalRevenue, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Where(b => b.Status == BookingStatus.COMPLETED).Sum(b => b.TotalPrice) : 0f))
                .ForMember(dest => dest.ApplicationStatus, opt => opt.MapFrom(src => src.TechnicianApplication != null ? src.TechnicianApplication.Status : "Approved"))
                .ForMember(dest => dest.HasPressureWasher, opt => opt.MapFrom(src => src.TechnicianApplication == null || src.TechnicianApplication.HasPressureWasher))
                .ForMember(dest => dest.HasVacuumExtractor, opt => opt.MapFrom(src => src.TechnicianApplication == null || src.TechnicianApplication.HasVacuumExtractor))
                .ForMember(dest => dest.HasWaterTankGenerator, opt => opt.MapFrom(src => src.TechnicianApplication == null || src.TechnicianApplication.HasWaterTankGenerator))
                .ForMember(dest => dest.HasVehicle, opt => opt.MapFrom(src => src.TechnicianApplication == null || src.TechnicianApplication.HasVehicle));

            // 7. Dispute -> AdminDisputeDto
            CreateMap<Dispute, AdminDisputeDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.BookingNumber, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.BookingNumber : "#BK-0000"))
                .ForMember(dest => dest.BookingStatus, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.Status.ToString() : "UNKNOWN"))
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : "Customer"))
                .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Phone : string.Empty))
                .ForMember(dest => dest.TechnicianName, opt => opt.MapFrom(src => src.Booking != null && src.Booking.Technician != null ? src.Booking.Technician.FullName : null))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Booking != null && src.Booking.ServicePackage != null ? src.Booking.ServicePackage.Name : "Car Wash"))
                .ForMember(dest => dest.VehicleName, opt => opt.MapFrom(src => src.Booking != null && src.Booking.Vehicle != null ? $"{src.Booking.Vehicle.Make} {src.Booking.Vehicle.Model}" : "Vehicle"))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.Address : string.Empty))
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.TotalPrice : 0f))
                .ForMember(dest => dest.PhotoQACount, opt => opt.MapFrom(src => src.Booking != null && src.Booking.PhotoQAs != null ? src.Booking.PhotoQAs.Count : 0))
                .ForMember(dest => dest.ScheduledAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.ScheduledAt : (DateTime?)null))
                .ForMember(dest => dest.AcceptedAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.AcceptedAt : null))
                .ForMember(dest => dest.OnTheWayAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.OnTheWayAt : null))
                .ForMember(dest => dest.ArrivedAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.ArrivedAt : null))
                .ForMember(dest => dest.WashingStartedAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.WashingStartedAt : null))
                .ForMember(dest => dest.CompletedAt, opt => opt.MapFrom(src => src.Booking != null ? src.Booking.CompletedAt : null))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.Booking != null && src.Booking.PhotoQAs != null ? src.Booking.PhotoQAs.OrderBy(p => p.Timestamp) : Enumerable.Empty<PhotoQA>()));

            // 8. Payout -> AdminPayoutDto
            CreateMap<Payout, AdminPayoutDto>()
                .ForMember(dest => dest.TechnicianName, opt => opt.MapFrom(src => src.Technician != null ? src.Technician.FullName : "Technician"));

            // 9. Vehicle -> AdminCustomerVehicleDto
            CreateMap<Vehicle, AdminCustomerVehicleDto>()
                .ForMember(dest => dest.SizeType, opt => opt.MapFrom(src => src.SizeType.ToString()));

            // 10. Customer -> AdminCustomerDto
            CreateMap<Customer, AdminCustomerDto>()
                .ForMember(dest => dest.VehiclesCount, opt => opt.MapFrom(src => src.Vehicles != null ? src.Vehicles.Count : 0))
                .ForMember(dest => dest.BookingsCount, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Count : 0))
                .ForMember(dest => dest.DisputesCount, opt => opt.MapFrom(src => src.Disputes != null ? src.Disputes.Count : 0))
                .ForMember(dest => dest.TotalSpent, opt => opt.MapFrom(src => src.Bookings != null ? src.Bookings.Where(b => b.Status != BookingStatus.CANCELLED).Sum(b => b.TotalPrice) : 0f))
                .ForMember(dest => dest.SavedAddresses, opt => opt.MapFrom(src => src.SavedAddresses ?? new List<string>()))
                .ForMember(dest => dest.Vehicles, opt => opt.MapFrom(src => src.Vehicles ?? Enumerable.Empty<Vehicle>()));
        }
    }
}
