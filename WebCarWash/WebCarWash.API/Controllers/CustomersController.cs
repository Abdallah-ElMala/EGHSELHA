using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebCarWash.Application.DTOs.Customer;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        // Default Demo Customer ID for "Ahmed Khaled"
        private static readonly Guid DefaultDemoCustomerId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001");

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        private Guid GetCurrentCustomerId([FromHeader(Name = "X-Customer-Id")] Guid? headerCustomerId)
        {
            return headerCustomerId ?? DefaultDemoCustomerId;
        }

        /// <summary>
        /// Get live catalog (packages, active add-ons, active zones) configured by Admin.
        /// </summary>
        [HttpGet("catalog")]
        public async Task<ActionResult<CustomerCatalogDto>> GetCatalog()
        {
            return Ok(await _customerService.GetCatalogAsync());
        }

        /// <summary>
        /// Get Customer profile details, wallet balance, loyalty points, and saved addresses.
        /// </summary>
        [HttpGet("profile")]
        public async Task<ActionResult<CustomerProfileDto>> GetProfile([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var profile = await _customerService.GetProfileAsync(GetCurrentCustomerId(customerId));
            return Ok(profile);
        }

        /// <summary>
        /// Update Customer personal info (FullName, Phone, Email).
        /// </summary>
        [HttpPut("profile")]
        public async Task<ActionResult<CustomerProfileDto>> UpdateProfile(
            [FromBody] UpdateCustomerProfileDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var updated = await _customerService.UpdateProfileAsync(GetCurrentCustomerId(customerId), dto);
            if (updated == null) return NotFound(new { message = "Customer not found." });
            return Ok(updated);
        }

        /// <summary>
        /// Top up customer wallet balance.
        /// </summary>
        [HttpPost("wallet/topup")]
        public async Task<ActionResult<CustomerProfileDto>> TopUpWallet(
            [FromBody] WalletTopUpDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            if (dto.Amount <= 0) return BadRequest(new { message = "Top-up amount must be greater than zero." });
            var updated = await _customerService.TopUpWalletAsync(GetCurrentCustomerId(customerId), dto.Amount);
            if (updated == null) return NotFound(new { message = "Customer not found." });
            return Ok(updated);
        }

        /// <summary>
        /// 1. addVehicle(vehicleData): Register a new car under the customer's profile.
        /// </summary>
        [HttpPost("vehicles")]
        public async Task<ActionResult<CustomerVehicleDto>> AddVehicle(
            [FromBody] AddVehicleDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var vehicle = await _customerService.AddVehicleAsync(GetCurrentCustomerId(customerId), dto);
            return Ok(vehicle);
        }

        /// <summary>
        /// Remove a vehicle from the customer's garage.
        /// </summary>
        [HttpDelete("vehicles/{id}")]
        public async Task<IActionResult> DeleteVehicle(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var success = await _customerService.DeleteVehicleAsync(GetCurrentCustomerId(customerId), id);
            return Ok(new { success, vehicleId = id });
        }

        /// <summary>
        /// Get all registered vehicles for the customer.
        /// </summary>
        [HttpGet("vehicles")]
        public async Task<ActionResult<IEnumerable<CustomerVehicleDto>>> GetVehicles([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var list = await _customerService.GetVehiclesAsync(GetCurrentCustomerId(customerId));
            return Ok(list);
        }

        /// <summary>
        /// 2. createBooking(params): Initiates a new car wash booking with chosen package, vehicle, location, and time.
        /// </summary>
        [HttpPost("bookings")]
        public async Task<ActionResult<CustomerBookingDto>> CreateBooking(
            [FromBody] CreateCustomerBookingDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var booking = await _customerService.CreateBookingAsync(GetCurrentCustomerId(customerId), dto);
            return Ok(booking);
        }

        /// <summary>
        /// Get customer booking history.
        /// </summary>
        [HttpGet("bookings")]
        public async Task<ActionResult<IEnumerable<CustomerBookingDto>>> GetBookings([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var list = await _customerService.GetBookingsAsync(GetCurrentCustomerId(customerId));
            return Ok(list);
        }

        /// <summary>
        /// Get details of a single booking.
        /// </summary>
        [HttpGet("bookings/{id}")]
        public async Task<ActionResult<CustomerBookingDto>> GetBookingDetails(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var booking = await _customerService.GetBookingDetailsAsync(GetCurrentCustomerId(customerId), id);
            if (booking == null) return NotFound(new { message = $"Booking {id} not found." });
            return Ok(booking);
        }

        /// <summary>
        /// Cancel or delete a booking: unrestricted before technician accepts, or within 2 minutes after acceptance.
        /// </summary>
        [HttpDelete("bookings/{id}")]
        [HttpPost("bookings/{id}/cancel")]
        public async Task<ActionResult<CancelBookingResultDto>> CancelBooking(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var result = await _customerService.CancelOrDeleteBookingAsync(GetCurrentCustomerId(customerId), id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// 3. payDeposit(bookingId): Pays mandatory 200 EGP upfront deposit to lock in and confirm booking.
        /// </summary>
        [HttpPost("bookings/{id}/deposit")]
        public async Task<ActionResult<CustomerPaymentResultDto>> PayDeposit(
            Guid id,
            [FromBody] PayDepositRequestDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var payment = await _customerService.PayDepositAsync(GetCurrentCustomerId(customerId), id, dto);
            if (payment.Status == "FAILED")
            {
                return BadRequest(new { message = "Insufficient wallet balance for the 200 EGP deposit. Please top up your wallet or choose another payment method." });
            }
            return Ok(payment);
        }

        /// <summary>
        /// 4. approveUpsell(upsellId, decision): Approves or declines an extra charge proposed by technician.
        /// </summary>
        [HttpPost("upsells/{id}/decision")]
        public async Task<IActionResult> ApproveUpsell(
            Guid id,
            [FromBody] ApproveUpsellRequestDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var success = await _customerService.ApproveUpsellAsync(GetCurrentCustomerId(customerId), id, dto.Decision);
            return Ok(new
            {
                success,
                message = dto.Decision ? "Upsell approved. Total price updated." : "Upsell declined. Proceeding with standard package."
            });
        }

        /// <summary>
        /// 5. submitReview(bookingId, rating): Submits star rating, feedback comment, and optional tip after wash is completed.
        /// </summary>
        [HttpPost("bookings/{id}/reviews")]
        public async Task<ActionResult<CustomerReviewResultDto>> SubmitReview(
            Guid id,
            [FromBody] SubmitCustomerReviewDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var review = await _customerService.SubmitReviewAsync(GetCurrentCustomerId(customerId), id, dto);
            return Ok(review);
        }

        /// <summary>
        /// Get all submitted reviews by the customer.
        /// </summary>
        [HttpGet("reviews")]
        public async Task<ActionResult<IEnumerable<CustomerReviewItemDto>>> GetReviews([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var reviews = await _customerService.GetReviewsAsync(GetCurrentCustomerId(customerId));
            return Ok(reviews);
        }

        /// <summary>
        /// 6. fileDispute(bookingId, reason): Opens official complaint within 12 hours of wash completion if unsatisfied.
        /// </summary>
        [HttpPost("bookings/{id}/disputes")]
        public async Task<ActionResult<CustomerDisputeResultDto>> FileDispute(
            Guid id,
            [FromBody] FileCustomerDisputeDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var dispute = await _customerService.FileDisputeAsync(GetCurrentCustomerId(customerId), id, dto);
            return Ok(dispute);
        }

        /// <summary>
        /// Add a saved address for faster future bookings.
        /// </summary>
        [HttpPost("addresses")]
        public async Task<IActionResult> AddSavedAddress(
            [FromBody] string address,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var success = await _customerService.AddSavedAddressAsync(GetCurrentCustomerId(customerId), address);
            return Ok(new { success, address });
        }

        /// <summary>
        /// Delete a saved address.
        /// </summary>
        [HttpDelete("addresses")]
        public async Task<IActionResult> DeleteSavedAddress(
            [FromBody] DeleteAddressDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var success = await _customerService.DeleteSavedAddressAsync(GetCurrentCustomerId(customerId), dto.Address);
            return Ok(new { success, address = dto.Address });
        }
    }
}
