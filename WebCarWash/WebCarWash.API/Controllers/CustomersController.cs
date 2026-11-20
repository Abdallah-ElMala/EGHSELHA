using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebCarWash.Application.DTOs.Customer;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "CUSTOMER,Customer,ADMIN,Admin")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        // Default Demo Customer ID for "Ahmed Khaled"
        private static readonly Guid DefaultDemoCustomerId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccc0001");

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        /// <summary>
        /// Resource-Based Ownership Helper: Extracts the current authenticated user's ID
        /// and guarantees customers can ONLY access their own resources.
        /// </summary>
        private Guid GetEffectiveCustomerId(Guid? requestedCustomerId = null)
        {
            // If user is Admin, they can access requested customer or fallback
            if (User.IsInRole("Admin") && requestedCustomerId.HasValue && requestedCustomerId.Value != Guid.Empty)
            {
                return requestedCustomerId.Value;
            }

            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (claim != null && Guid.TryParse(claim.Value, out var id))
            {
                return id;
            }

            // Fallback for demo header if present and no claims (or local dev)
            return requestedCustomerId ?? DefaultDemoCustomerId;
        }

        private bool IsAdmin() => User.IsInRole("Admin");

        /// <summary>
        /// Get live catalog (packages, active add-ons, active zones) configured by Admin.
        /// Open to all visitors (AllowAnonymous).
        /// </summary>
        [HttpGet("catalog")]
        [AllowAnonymous]
        public async Task<ActionResult<CustomerCatalogDto>> GetCatalog()
        {
            return Ok(await _customerService.GetCatalogAsync());
        }

        /// <summary>
        /// Get Customer profile details, wallet balance, loyalty points, and saved addresses.
        /// Resource-based: Customer can only retrieve their own profile.
        /// </summary>
        [HttpGet("profile")]
        public async Task<ActionResult<CustomerProfileDto>> GetProfile([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var profile = await _customerService.GetProfileAsync(effectiveId);
            return Ok(profile);
        }

        /// <summary>
        /// Update Customer personal info (FullName, Phone, Email).
        /// Resource-based: Customer can only update their own profile.
        /// </summary>
        [HttpPut("profile")]
        public async Task<ActionResult<CustomerProfileDto>> UpdateProfile(
            [FromBody] UpdateCustomerProfileDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var updated = await _customerService.UpdateProfileAsync(effectiveId, dto);
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
            var effectiveId = GetEffectiveCustomerId(customerId);
            var updated = await _customerService.TopUpWalletAsync(effectiveId, dto.Amount);
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
            var effectiveId = GetEffectiveCustomerId(customerId);
            var vehicle = await _customerService.AddVehicleAsync(effectiveId, dto);
            return Ok(vehicle);
        }

        /// <summary>
        /// Remove a vehicle from the customer's garage.
        /// Resource-based Ownership check: ensures vehicle belongs to the authenticated customer.
        /// </summary>
        [HttpDelete("vehicles/{id}")]
        public async Task<IActionResult> DeleteVehicle(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var vehicles = await _customerService.GetVehiclesAsync(effectiveId);
            var vehicleExists = false;
            foreach (var v in vehicles)
            {
                if (v.Id == id) { vehicleExists = true; break; }
            }

            if (!vehicleExists && !IsAdmin())
            {
                return StatusCode(403, new { success = false, message = "غير مصرح لك بحذف هذه المركبة لأنها لا تتبع حسابك." });
            }

            var success = await _customerService.DeleteVehicleAsync(effectiveId, id);
            return Ok(new { success, vehicleId = id });
        }

        /// <summary>
        /// Get all registered vehicles for the customer.
        /// </summary>
        [HttpGet("vehicles")]
        public async Task<ActionResult<IEnumerable<CustomerVehicleDto>>> GetVehicles([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var list = await _customerService.GetVehiclesAsync(effectiveId);
            return Ok(list);
        }

        /// <summary>
        /// 2. createBooking(params): Initiates a new car wash booking.
        /// </summary>
        [HttpPost("bookings")]
        public async Task<ActionResult<CustomerBookingDto>> CreateBooking(
            [FromBody] CreateCustomerBookingDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            if (dto.BookingType == WebCarWash.Domain.Enums.BookingType.SCHEDULED && dto.ScheduledAt < DateTime.UtcNow.AddMinutes(-10))
            {
                return BadRequest(new { success = false, message = "Scheduled date and time cannot be in the past." });
            }

            try
            {
                var effectiveId = GetEffectiveCustomerId(customerId);
                var booking = await _customerService.CreateBookingAsync(effectiveId, dto);
                return Ok(booking);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get customer booking history.
        /// </summary>
        [HttpGet("bookings")]
        public async Task<ActionResult<IEnumerable<CustomerBookingDto>>> GetBookings([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var list = await _customerService.GetBookingsAsync(effectiveId);
            return Ok(list);
        }

        /// <summary>
        /// Get details of a single booking.
        /// Resource-based Ownership check: ensures booking belongs to the authenticated customer.
        /// </summary>
        [HttpGet("bookings/{id}")]
        public async Task<ActionResult<CustomerBookingDto>> GetBookingDetails(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var booking = await _customerService.GetBookingDetailsAsync(effectiveId, id);
            if (booking == null) return NotFound(new { message = $"Booking {id} not found." });
            return Ok(booking);
        }

        /// <summary>
        /// Cancel or delete a booking.
        /// Resource-based Ownership check: ensures booking belongs to the authenticated customer.
        /// </summary>
        [HttpDelete("bookings/{id}")]
        [HttpPost("bookings/{id}/cancel")]
        public async Task<ActionResult<CancelBookingResultDto>> CancelBooking(
            Guid id,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var booking = await _customerService.GetBookingDetailsAsync(effectiveId, id);
            if (booking == null && !IsAdmin())
            {
                return StatusCode(403, new { success = false, message = "غير مصرح لك بإلغاء هذا الحجز لأنه يتبع مستخدم آخر." });
            }

            var result = await _customerService.CancelOrDeleteBookingAsync(effectiveId, id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        /// <summary>
        /// 3. payDeposit(bookingId): Pays mandatory 200 EGP upfront deposit.
        /// </summary>
        [HttpPost("bookings/{id}/deposit")]
        public async Task<ActionResult<CustomerPaymentResultDto>> PayDeposit(
            Guid id,
            [FromBody] PayDepositRequestDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var payment = await _customerService.PayDepositAsync(effectiveId, id, dto);
            if (payment.Status == "FAILED")
            {
                return BadRequest(payment);
            }
            return Ok(payment);
        }

        /// <summary>
        /// Approve or reject an upsell inspection proposal.
        /// </summary>
        [HttpPost("bookings/{id}/upsell")]
        public async Task<IActionResult> DecideUpsell(
            Guid id,
            [FromBody] ApproveUpsellRequestDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var result = await _customerService.ApproveUpsellAsync(effectiveId, id, dto.Decision);
            return Ok(new { success = result });
        }

        /// <summary>
        /// 4. fileDispute(bookingId, reason): Raises a customer dispute.
        /// </summary>
        [HttpPost("bookings/{id}/dispute")]
        public async Task<ActionResult<CustomerDisputeResultDto>> FileDispute(
            Guid id,
            [FromBody] FileCustomerDisputeDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var dispute = await _customerService.FileDisputeAsync(effectiveId, id, dto);
            return Ok(dispute);
        }

        /// <summary>
        /// 5. reviewService(bookingId, rating, comment): Submits a review and rating.
        /// </summary>
        [HttpPost("bookings/{id}/review")]
        public async Task<ActionResult<CustomerReviewResultDto>> SubmitReview(
            Guid id,
            [FromBody] SubmitCustomerReviewDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var review = await _customerService.SubmitReviewAsync(effectiveId, id, dto);
            return Ok(review);
        }

        /// <summary>
        /// Get reviews for the customer.
        /// </summary>
        [HttpGet("reviews")]
        public async Task<ActionResult<IEnumerable<CustomerReviewItemDto>>> GetReviews([FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var list = await _customerService.GetReviewsAsync(effectiveId);
            return Ok(list);
        }

        /// <summary>
        /// Add a new saved address.
        /// </summary>
        [HttpPost("addresses")]
        public async Task<IActionResult> AddAddress(
            [FromBody] AddAddressDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var success = await _customerService.AddSavedAddressAsync(effectiveId, dto.Address);
            return Ok(new { success });
        }

        /// <summary>
        /// Delete a saved address.
        /// </summary>
        [HttpDelete("addresses")]
        public async Task<IActionResult> DeleteAddress(
            [FromBody] DeleteAddressDto dto,
            [FromHeader(Name = "X-Customer-Id")] Guid? customerId)
        {
            var effectiveId = GetEffectiveCustomerId(customerId);
            var success = await _customerService.DeleteSavedAddressAsync(effectiveId, dto.Address);
            return Ok(new { success });
        }
    }
}
