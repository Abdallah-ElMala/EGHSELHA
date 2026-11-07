using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebCarWash.Application.DTOs.Customer;

namespace WebCarWash.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<CustomerProfileDto?> GetProfileAsync(Guid customerId);
        Task<CustomerProfileDto?> UpdateProfileAsync(Guid customerId, UpdateCustomerProfileDto dto);
        Task<CustomerVehicleDto> AddVehicleAsync(Guid customerId, AddVehicleDto dto);
        Task<bool> DeleteVehicleAsync(Guid customerId, Guid vehicleId);
        Task<IEnumerable<CustomerVehicleDto>> GetVehiclesAsync(Guid customerId);
        Task<CustomerBookingDto> CreateBookingAsync(Guid customerId, CreateCustomerBookingDto dto);
        Task<IEnumerable<CustomerBookingDto>> GetBookingsAsync(Guid customerId);
        Task<CustomerBookingDto?> GetBookingDetailsAsync(Guid customerId, Guid bookingId);
        Task<CustomerPaymentResultDto> PayDepositAsync(Guid customerId, Guid bookingId, PayDepositRequestDto dto);
        Task<bool> ApproveUpsellAsync(Guid customerId, Guid upsellId, bool decision);
        Task<CustomerReviewResultDto> SubmitReviewAsync(Guid customerId, Guid bookingId, SubmitCustomerReviewDto dto);
        Task<IEnumerable<CustomerReviewItemDto>> GetReviewsAsync(Guid customerId);
        Task<CustomerDisputeResultDto> FileDisputeAsync(Guid customerId, Guid bookingId, FileCustomerDisputeDto dto);
        Task<bool> AddSavedAddressAsync(Guid customerId, string address);
        Task<bool> DeleteSavedAddressAsync(Guid customerId, string address);
    }
}
