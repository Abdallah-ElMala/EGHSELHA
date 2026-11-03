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
        Task<TechnicianEarningsDto?> GetEarningsAsync(Guid technicianId);
        Task<TechnicianProfileDto?> GetProfileAsync(Guid technicianId);
        Task<bool> UpdateProfileAsync(Guid technicianId, TechnicianProfileDto dto);
        Task<TechnicianSettingsDto?> GetSettingsAsync(Guid technicianId);
        Task<bool> UpdateSettingsAsync(Guid technicianId, TechnicianSettingsDto dto);
        Task<IEnumerable<TechnicianNotificationDto>> GetNotificationsAsync(Guid technicianId);
        Task<bool> MarkNotificationsAsReadAsync(Guid technicianId);
    }
}
