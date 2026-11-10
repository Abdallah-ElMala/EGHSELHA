using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebCarWash.Application.DTOs.Technician;

namespace WebCarWash.Application.Interfaces
{
    public interface ITechnicianService
    {
        Task<TechnicianDashboardDto?> GetDashboardAsync(Guid technicianId);
        Task<IEnumerable<TechnicianJobDto>> GetJobsAsync(Guid technicianId, string? status = null, string? search = null);
        Task<TechnicianJobDto?> GetJobDetailsAsync(Guid technicianId, string bookingIdOrNumber);
        Task<bool> UpdateJobStatusAsync(Guid technicianId, string bookingIdOrNumber, string newStatus);
        Task<(bool Success, string? ErrorMessage)> UpdateJobStatusDetailedAsync(Guid technicianId, string bookingIdOrNumber, string newStatus);
        Task<TechnicianEarningsDto?> GetEarningsAsync(Guid technicianId, string? range = "7d");
        Task<TechnicianProfileDto?> GetProfileAsync(Guid technicianId);
        Task<bool> UpdateProfileAsync(Guid technicianId, TechnicianProfileDto dto);
        Task<TechnicianSettingsDto?> GetSettingsAsync(Guid technicianId);
        Task<bool> UpdateSettingsAsync(Guid technicianId, TechnicianSettingsDto dto);
        Task<IEnumerable<TechnicianNotificationDto>> GetNotificationsAsync(Guid technicianId);
        Task<bool> MarkNotificationsAsReadAsync(Guid technicianId);

        // --- Core Specification Behaviors ---
        Task<bool> UpdateGPSLocationAsync(Guid technicianId, float lat, float lng);
        Task<bool> ToggleAvailabilityAsync(Guid technicianId, bool isOnline);
        Task<bool> MarkArrivedAsync(Guid technicianId, string bookingIdOrNumber);
        Task<PhotoQADto?> UploadQAPhotoAsync(Guid technicianId, string bookingIdOrNumber, UploadQAPhotoDto dto);
        Task<IEnumerable<PhotoQADto>> GetQAPhotosAsync(Guid technicianId, string bookingIdOrNumber);
        Task<InspectionUpsellDto?> ProposeUpsellAsync(Guid technicianId, string bookingIdOrNumber, ProposeUpsellDto dto);
        Task<InspectionUpsellDto?> GetUpsellAsync(Guid technicianId, string bookingIdOrNumber);
        Task<PayoutDto?> RequestPayoutAsync(Guid technicianId, RequestPayoutDto dto);
        Task<IEnumerable<PayoutDto>> GetPayoutHistoryAsync(Guid technicianId);
        Task<IEnumerable<JobOfferDto>> GetJobOffersAsync(Guid technicianId);
        Task<JobOfferResponseDto> RespondToJobOfferAsync(Guid technicianId, Guid offerId, bool accept);
    }
}
