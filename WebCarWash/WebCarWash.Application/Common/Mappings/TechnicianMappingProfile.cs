using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using WebCarWash.Application.DTOs.Technician;
using WebCarWash.Domain.Entities;
using WebCarWash.Domain.Enums;

namespace WebCarWash.Application.Common.Mappings
{
    public class TechnicianMappingProfile : Profile
    {
        public TechnicianMappingProfile()
        {
            // 1. Technician <-> TechnicianProfileDto
            CreateMap<Technician, TechnicianProfileDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Area, opt => opt.MapFrom(src => src.ServiceArea))
                .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.ShortBio))
                .ForMember(dest => dest.PhotoPreview, opt => opt.MapFrom(src => src.AvatarUrl))
                .ReverseMap()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.ServiceArea, opt => opt.MapFrom(src => src.Area))
                .ForMember(dest => dest.ShortBio, opt => opt.MapFrom(src => src.Bio))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.PhotoPreview));

            // 2. Technician <-> TechnicianSettingsDto
            CreateMap<Technician, TechnicianSettingsDto>()
                .ForMember(dest => dest.Available, opt => opt.MapFrom(src => src.IsOnline))
                .ForMember(dest => dest.Push, opt => opt.MapFrom(src => src.PushNotificationsEnabled))
                .ForMember(dest => dest.Sms, opt => opt.MapFrom(src => src.SmsNotificationsEnabled))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.EmailNotificationsEnabled))
                .ReverseMap()
                .ForMember(dest => dest.IsOnline, opt => opt.MapFrom(src => src.Available))
                .ForMember(dest => dest.PushNotificationsEnabled, opt => opt.MapFrom(src => src.Push))
                .ForMember(dest => dest.SmsNotificationsEnabled, opt => opt.MapFrom(src => src.Sms))
                .ForMember(dest => dest.EmailNotificationsEnabled, opt => opt.MapFrom(src => src.Email));

            // 3. Booking -> TechnicianJobDto
            CreateMap<Booking, TechnicianJobDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.BookingNumber))
                .ForMember(dest => dest.BookingNumber, opt => opt.MapFrom(src => src.BookingNumber))
                .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : "Customer"))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Phone : "+20 100 123 4567"))
                .ForMember(dest => dest.Service, opt => opt.MapFrom(src => src.ServicePackage != null ? src.ServicePackage.Name : "Car Wash"))
                .ForMember(dest => dest.Car, opt => opt.MapFrom(src => src.Vehicle != null ? $"{src.Vehicle.Make} {src.Vehicle.Model}" : "Sedan"))
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.ScheduledAt.ToString("MMM dd")))
                .ForMember(dest => dest.Time, opt => opt.MapFrom(src => src.ScheduledAt.ToString("hh:mm tt")))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.TotalPrice))
                .ForMember(dest => dest.BasePackagePrice, opt => opt.MapFrom(src => src.BasePackagePrice > 0 ? src.BasePackagePrice : (src.ServicePackage != null ? src.ServicePackage.BasePrice : src.TotalPrice)))
                .ForMember(dest => dest.VehicleMultiplier, opt => opt.MapFrom(src => src.VehicleMultiplier > 0 ? src.VehicleMultiplier : 1.0f))
                .ForMember(dest => dest.AddOnsSubtotal, opt => opt.MapFrom(src => src.AddOnsSubtotal))
                .ForMember(dest => dest.DistanceSurcharge, opt => opt.MapFrom(src => src.DistanceSurcharge))
                .ForMember(dest => dest.UpsellTotal, opt => opt.MapFrom(src => src.UpsellTotal))
                .ForMember(dest => dest.DepositAmount, opt => opt.MapFrom(src => src.DepositAmount))
                .ForMember(dest => dest.RemainingBalance, opt => opt.MapFrom(src => MathF.Max(0f, src.TotalPrice - src.DepositAmount)))
                .ForMember(dest => dest.TechPayout, opt => opt.MapFrom(src => (float)Math.Round(src.TotalPrice * 0.7f, MidpointRounding.AwayFromZero)))
                .ForMember(dest => dest.BookingType, opt => opt.MapFrom(src => src.BookingType.ToString()))
                .ForMember(dest => dest.AddOnNames, opt => opt.MapFrom(src => src.BookingAddOns != null ? src.BookingAddOns.Where(ba => ba.AddOn != null).Select(ba => ba.AddOn.Name).ToList() : new List<string>()))
                .ForMember(dest => dest.BookingStatus, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.IsAccepted, opt => opt.MapFrom(src => src.TechnicianId != null && src.Status != BookingStatus.PENDING && src.Status != BookingStatus.DEPOSIT_PAID && src.Status != BookingStatus.CANCELLED))
                .ForMember(dest => dest.DepositPaid, opt => opt.MapFrom(src => src.Status != BookingStatus.PENDING && src.Status != BookingStatus.CANCELLED))
                .ForMember(dest => dest.AcceptedAt, opt => opt.MapFrom(src => src.AcceptedAt))
                .ForMember(dest => dest.CancelDeadlineUtc, opt => opt.MapFrom(src => src.AcceptedAt.HasValue ? src.AcceptedAt.Value.AddMinutes(Booking.CancellationGraceMinutes) : (DateTime?)null))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Address) ? "Cairo, Nasr City" : src.Address))
                .ForMember(dest => dest.Distance, opt => opt.MapFrom(src => src.DistanceText))
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.ParkingLatitude))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.ParkingLongitude));

            // 4. Notification -> TechnicianNotificationDto
            CreateMap<Notification, TechnicianNotificationDto>()
                .ForMember(dest => dest.Desc, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IconType, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.IsUnread, opt => opt.MapFrom(src => !src.IsRead));

            // 5. Payout -> PayoutDto
            CreateMap<Payout, PayoutDto>();

            // 6. PhotoQA -> PhotoQADto
            CreateMap<PhotoQA, PhotoQADto>()
                .ForMember(dest => dest.PhotoType, opt => opt.MapFrom(src => src.PhotoType.ToString()))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));

            // 7. InspectionUpsell -> InspectionUpsellDto
            CreateMap<InspectionUpsell, InspectionUpsellDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
        }
    }
}
