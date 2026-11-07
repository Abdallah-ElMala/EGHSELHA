using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebCarWash.Application.DTOs.Technician;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TechniciansController : ControllerBase
    {
        private readonly ITechnicianService _technicianService;
        // Default Demo Technician ID for "Mostafa Ali"
        private static readonly Guid DefaultDemoTechId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        public TechniciansController(ITechnicianService technicianService)
        {
            _technicianService = technicianService;
        }

        private Guid GetCurrentTechnicianId([FromHeader(Name = "X-Technician-Id")] Guid? headerTechId)
        {
            return headerTechId ?? DefaultDemoTechId;
        }

        /// <summary>
        /// Get Dashboard stats, today's jobs, next customer, weekly performance, and checklist.
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<ActionResult<TechnicianDashboardDto>> GetDashboard([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetDashboardAsync(GetCurrentTechnicianId(techId));
            return Ok(result);
        }

        /// <summary>
        /// Get assigned bookings/jobs with optional status filtering (All, Upcoming, On The Way, In Progress, Completed) and search.
        /// </summary>
        [HttpGet("jobs")]
        public async Task<ActionResult<IEnumerable<TechnicianJobDto>>> GetJobs(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetJobsAsync(GetCurrentTechnicianId(techId), status, search);
            return Ok(result);
        }

        /// <summary>
        /// Get details of a single booking by ID or BookingNumber.
        /// </summary>
        [HttpGet("jobs/{id}")]
        public async Task<ActionResult<TechnicianJobDto>> GetJobDetails(string id, [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetJobDetailsAsync(GetCurrentTechnicianId(techId), id);
            if (result == null)
            {
                return NotFound(new { message = $"Job {id} not found." });
            }
            return Ok(result);
        }

        /// <summary>
        /// Update job progress status ('On The Way', 'In Progress', 'Completed').
        /// </summary>
        [HttpPut("jobs/{id}/status")]
        public async Task<IActionResult> UpdateJobStatus(
            string id,
            [FromBody] UpdateJobStatusDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.UpdateJobStatusAsync(GetCurrentTechnicianId(techId), id, dto.Status);
            if (!success)
            {
                return BadRequest(new { message = "Failed to update job status." });
            }
            return Ok(new { message = $"Booking {id} marked as {dto.Status}." });
        }

        /// <summary>
        /// Get Earnings overview, KPIs, weekly 7-days chart, and recent transactions.
        /// </summary>
        [HttpGet("earnings")]
        public async Task<ActionResult<TechnicianEarningsDto>> GetEarnings([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetEarningsAsync(GetCurrentTechnicianId(techId));
            return Ok(result);
        }

        /// <summary>
        /// Get Technician profile information.
        /// </summary>
        [HttpGet("profile")]
        public async Task<ActionResult<TechnicianProfileDto>> GetProfile([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetProfileAsync(GetCurrentTechnicianId(techId));
            return Ok(result);
        }

        /// <summary>
        /// Update Technician personal information.
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] TechnicianProfileDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.UpdateProfileAsync(GetCurrentTechnicianId(techId), dto);
            if (!success)
            {
                return BadRequest(new { message = "Failed to update profile." });
            }
            return Ok(new { message = "Profile updated successfully." });
        }

        /// <summary>
        /// Get Technician availability and notification settings.
        /// </summary>
        [HttpGet("settings")]
        public async Task<ActionResult<TechnicianSettingsDto>> GetSettings([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetSettingsAsync(GetCurrentTechnicianId(techId));
            return Ok(result);
        }

        /// <summary>
        /// Update Technician settings (availability, working hours, notifications).
        /// </summary>
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings(
            [FromBody] TechnicianSettingsDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.UpdateSettingsAsync(GetCurrentTechnicianId(techId), dto);
            if (!success)
            {
                return BadRequest(new { message = "Failed to update settings." });
            }
            return Ok(new { message = "Settings saved successfully." });
        }

        /// <summary>
        /// Get Technician notifications list.
        /// </summary>
        [HttpGet("notifications")]
        public async Task<ActionResult<IEnumerable<TechnicianNotificationDto>>> GetNotifications([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var result = await _technicianService.GetNotificationsAsync(GetCurrentTechnicianId(techId));
            return Ok(result);
        }

        /// <summary>
        /// Mark all notifications as read.
        /// </summary>
        [HttpPost("notifications/read-all")]
        public async Task<IActionResult> MarkNotificationsAsRead([FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            await _technicianService.MarkNotificationsAsReadAsync(GetCurrentTechnicianId(techId));
            return Ok(new { message = "All notifications marked as read." });
        }

        // ==========================================
        // Technician Specification Endpoints
        // ==========================================

        /// <summary>
        /// 1. Update live GPS location of technician.
        /// </summary>
        [HttpPut("location")]
        public async Task<IActionResult> UpdateGPSLocation(
            [FromBody] UpdateLocationDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.UpdateGPSLocationAsync(GetCurrentTechnicianId(techId), dto.Latitude, dto.Longitude);
            return Ok(new { success, message = "Location updated." });
        }

        /// <summary>
        /// 2. Toggle technician online/offline availability.
        /// </summary>
        [HttpPut("availability")]
        public async Task<IActionResult> ToggleAvailability(
            [FromBody] bool isOnline,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.ToggleAvailabilityAsync(GetCurrentTechnicianId(techId), isOnline);
            return Ok(new { success, isOnline });
        }

        /// <summary>
        /// 3. Mark technician arrived at booking location.
        /// </summary>
        [HttpPut("jobs/{id}/arrived")]
        public async Task<IActionResult> MarkArrived(
            string id,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.MarkArrivedAsync(GetCurrentTechnicianId(techId), id);
            return Ok(new { success, message = $"Technician arrived at booking {id}." });
        }

        /// <summary>
        /// 4. Upload mandatory QA photo (Before or After).
        /// </summary>
        [HttpPost("jobs/{id}/photos")]
        public async Task<ActionResult<PhotoQADto>> UploadQAPhoto(
            string id,
            [FromBody] UploadQAPhotoDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var photo = await _technicianService.UploadQAPhotoAsync(GetCurrentTechnicianId(techId), id, dto);
            return Ok(photo);
        }

        /// <summary>
        /// Get all QA photos for a booking.
        /// </summary>
        [HttpGet("jobs/{id}/photos")]
        public async Task<ActionResult<IEnumerable<PhotoQADto>>> GetQAPhotos(
            string id,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var photos = await _technicianService.GetQAPhotosAsync(GetCurrentTechnicianId(techId), id);
            return Ok(photos);
        }

        /// <summary>
        /// 5. Propose on-site inspection upsell for extra stains/cleaning.
        /// </summary>
        [HttpPost("jobs/{id}/upsell")]
        public async Task<ActionResult<InspectionUpsellDto>> ProposeUpsell(
            string id,
            [FromBody] ProposeUpsellDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var upsell = await _technicianService.ProposeUpsellAsync(GetCurrentTechnicianId(techId), id, dto);
            return Ok(upsell);
        }

        /// <summary>
        /// Get upsell details for a booking.
        /// </summary>
        [HttpGet("jobs/{id}/upsell")]
        public async Task<ActionResult<InspectionUpsellDto>> GetUpsell(
            string id,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var upsell = await _technicianService.GetUpsellAsync(GetCurrentTechnicianId(techId), id);
            return Ok(upsell);
        }

        /// <summary>
        /// 6. Request earnings payout / withdrawal.
        /// </summary>
        [HttpPost("payout")]
        public async Task<ActionResult<PayoutDto>> RequestPayout(
            [FromBody] RequestPayoutDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var payout = await _technicianService.RequestPayoutAsync(GetCurrentTechnicianId(techId), dto);
            return Ok(payout);
        }

        /// <summary>
        /// Get payout history.
        /// </summary>
        [HttpGet("payouts")]
        public async Task<ActionResult<IEnumerable<PayoutDto>>> GetPayouts(
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var list = await _technicianService.GetPayoutHistoryAsync(GetCurrentTechnicianId(techId));
            return Ok(list);
        }

        /// <summary>
        /// 7. Get pending 45-second Job Offers.
        /// </summary>
        [HttpGet("offers")]
        public async Task<ActionResult<IEnumerable<JobOfferDto>>> GetJobOffers(
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var offers = await _technicianService.GetJobOffersAsync(GetCurrentTechnicianId(techId));
            return Ok(offers);
        }

        /// <summary>
        /// Respond to 45-second Job Offer (Accept / Pass).
        /// </summary>
        [HttpPost("offers/{id}/respond")]
        public async Task<IActionResult> RespondToJobOffer(
            Guid id,
            [FromBody] RespondJobOfferDto dto,
            [FromHeader(Name = "X-Technician-Id")] Guid? techId)
        {
            var success = await _technicianService.RespondToJobOfferAsync(GetCurrentTechnicianId(techId), id, dto.Accept);
            return Ok(new { success, message = dto.Accept ? "Job offer accepted." : "Job offer passed." });
        }
    }
}
