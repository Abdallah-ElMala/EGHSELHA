using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebCarWash.Application.DTOs.Admin;

namespace WebCarWash.Application.Interfaces
{
    public interface IAdminService
    {
        Task<AdminDashboardDto> GetDashboardAsync();
        Task<IEnumerable<AdminBookingDto>> GetBookingsAsync(string? status = null, string? search = null);
        Task<bool> AssignTechnicianAsync(Guid bookingId, Guid technicianId);
        Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status);

        Task<IEnumerable<AdminTechnicianDto>> GetTechniciansAsync();
        Task<bool> ToggleTechnicianAvailabilityAsync(Guid technicianId, bool isOnline);
        Task<bool> ReviewTechnicianApplicationAsync(Guid technicianId, string decision);

        Task<IEnumerable<AdminCustomerDto>> GetCustomersAsync();

        Task<AdminCatalogDto> GetCatalogAsync();
        Task<AdminServicePackageDto?> UpdateServicePackageAsync(Guid packageId, UpdateServicePackageDto dto);
        Task<AdminAddOnDto?> UpdateAddOnAsync(Guid addOnId, UpdateAddOnDto dto);

        Task<IEnumerable<AdminServiceZoneDto>> GetServiceZonesAsync();
        Task<AdminServiceZoneDto> CreateServiceZoneAsync(UpsertServiceZoneDto dto);
        Task<AdminServiceZoneDto?> UpdateServiceZoneAsync(Guid zoneId, UpsertServiceZoneDto dto);

        Task<IEnumerable<AdminDisputeDto>> GetDisputesAsync();
        Task<AdminDisputeDto?> ResolveDisputeAsync(Guid disputeId, ResolveDisputeDto dto);

        Task<IEnumerable<AdminPayoutDto>> GetPayoutsAsync();
        Task<AdminPayoutDto?> ProcessPayoutAsync(Guid payoutId, bool approve);
    }
}
