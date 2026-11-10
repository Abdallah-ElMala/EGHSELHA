using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebCarWash.Application.DTOs.Admin;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminsController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminsController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
        {
            return Ok(await _adminService.GetDashboardAsync());
        }

        [HttpGet("bookings")]
        public async Task<ActionResult<IEnumerable<AdminBookingDto>>> GetBookings(
            [FromQuery] string? status,
            [FromQuery] string? search)
        {
            return Ok(await _adminService.GetBookingsAsync(status, search));
        }

        [HttpPut("bookings/{id}/assign")]
        public async Task<IActionResult> AssignTechnician(Guid id, [FromBody] AssignTechnicianDto dto)
        {
            var success = await _adminService.AssignTechnicianAsync(id, dto.TechnicianId);
            if (!success) return NotFound(new { message = "Booking or Technician not found." });
            return Ok(new { success = true, message = "Technician assigned to booking." });
        }

        [HttpPut("bookings/{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] AdminUpdateBookingStatusDto dto)
        {
            var success = await _adminService.UpdateBookingStatusAsync(id, dto.Status);
            if (!success) return BadRequest(new { message = "Invalid booking ID or status." });
            return Ok(new { success = true, status = dto.Status });
        }

        [HttpGet("technicians")]
        public async Task<ActionResult<IEnumerable<AdminTechnicianDto>>> GetTechnicians()
        {
            return Ok(await _adminService.GetTechniciansAsync());
        }

        [HttpPut("technicians/{id}/availability")]
        public async Task<IActionResult> ToggleTechnicianAvailability(Guid id, [FromBody] bool isOnline)
        {
            var success = await _adminService.ToggleTechnicianAvailabilityAsync(id, isOnline);
            if (!success) return NotFound(new { message = "Technician not found." });
            return Ok(new { success = true, isOnline });
        }

        [HttpPut("technicians/{id}/application")]
        public async Task<IActionResult> ReviewTechnicianApplication(Guid id, [FromBody] ReviewTechApplicationDto dto)
        {
            var success = await _adminService.ReviewTechnicianApplicationAsync(id, dto.Decision);
            if (!success) return NotFound(new { message = "Technician not found." });
            return Ok(new { success = true, decision = dto.Decision });
        }

        [HttpGet("customers")]
        public async Task<ActionResult<IEnumerable<AdminCustomerDto>>> GetCustomers()
        {
            return Ok(await _adminService.GetCustomersAsync());
        }

        [HttpGet("catalog")]
        public async Task<ActionResult<AdminCatalogDto>> GetCatalog()
        {
            return Ok(await _adminService.GetCatalogAsync());
        }

        [HttpPut("packages/{id}")]
        public async Task<ActionResult<AdminServicePackageDto>> UpdateServicePackage(Guid id, [FromBody] UpdateServicePackageDto dto)
        {
            var updated = await _adminService.UpdateServicePackageAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Service package not found." });
            return Ok(updated);
        }

        [HttpPut("addons/{id}")]
        public async Task<ActionResult<AdminAddOnDto>> UpdateAddOn(Guid id, [FromBody] UpdateAddOnDto dto)
        {
            var updated = await _adminService.UpdateAddOnAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Add-on not found." });
            return Ok(updated);
        }

        [HttpGet("zones")]
        public async Task<ActionResult<IEnumerable<AdminServiceZoneDto>>> GetZones()
        {
            return Ok(await _adminService.GetServiceZonesAsync());
        }

        [HttpPost("zones")]
        public async Task<ActionResult<AdminServiceZoneDto>> CreateZone([FromBody] UpsertServiceZoneDto dto)
        {
            var created = await _adminService.CreateServiceZoneAsync(dto);
            return Ok(created);
        }

        [HttpPut("zones/{id}")]
        public async Task<ActionResult<AdminServiceZoneDto>> UpdateZone(Guid id, [FromBody] UpsertServiceZoneDto dto)
        {
            var updated = await _adminService.UpdateServiceZoneAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Service zone not found." });
            return Ok(updated);
        }

        [HttpGet("disputes")]
        public async Task<ActionResult<IEnumerable<AdminDisputeDto>>> GetDisputes()
        {
            return Ok(await _adminService.GetDisputesAsync());
        }

        [HttpPost("disputes/{id}/resolve")]
        public async Task<ActionResult<AdminDisputeDto>> ResolveDispute(Guid id, [FromBody] ResolveDisputeDto dto)
        {
            var updated = await _adminService.ResolveDisputeAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Dispute not found." });
            return Ok(updated);
        }

        [HttpGet("payouts")]
        public async Task<ActionResult<IEnumerable<AdminPayoutDto>>> GetPayouts()
        {
            return Ok(await _adminService.GetPayoutsAsync());
        }

        [HttpPost("payouts/{id}/process")]
        public async Task<ActionResult<AdminPayoutDto>> ProcessPayout(Guid id, [FromBody] ProcessPayoutDto dto)
        {
            var updated = await _adminService.ProcessPayoutAsync(id, dto.Approve);
            if (updated == null) return NotFound(new { message = "Payout not found." });
            return Ok(updated);
        }
    }
}
