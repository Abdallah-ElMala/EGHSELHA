using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebCarWash.Application.DTOs.Auth;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        private Guid? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (claim != null && Guid.TryParse(claim.Value, out var id))
            {
                return id;
            }
            return null;
        }

        /// <summary>
        /// Customer, Technician, or Admin Login with email and password.
        /// Returns JWT Access Token + Refresh Token (or 2FA challenge if enabled).
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto)
        {
            var response = await _authService.LoginAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Register a new Customer.
        /// </summary>
        [HttpPost("register-customer")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> RegisterCustomer([FromBody] RegisterCustomerDto dto)
        {
            var response = await _authService.RegisterCustomerAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Register a new Technician.
        /// </summary>
        [HttpPost("register-technician")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> RegisterTechnician([FromBody] RegisterTechnicianDto dto)
        {
            var response = await _authService.RegisterTechnicianAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Refresh JWT Access Token using Refresh Token (Refresh Token Rotation).
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            var response = await _authService.RefreshTokenAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Revoke Refresh Token (for explicit logout / token invalidation).
        /// </summary>
        [HttpPost("revoke-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto dto)
        {
            var success = await _authService.RevokeRefreshTokenAsync(dto.RefreshToken, GetCurrentUserId());
            if (!success)
            {
                return BadRequest(new { success = false, message = "رمز التحديث غير صالح أو لم يتم العثور على المستخدم." });
            }
            return Ok(new { success = true, message = "تم إلغاء صلاحية رمز التحديث بنجاح." });
        }

        /// <summary>
        /// Logout current authenticated user and invalidate their refresh token.
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                await _authService.RevokeRefreshTokenAsync(null, userId.Value);
            }
            return Ok(new { success = true, message = "تم تسجيل الخروج بنجاح." });
        }

        /// <summary>
        /// Verify 2FA code during login and obtain JWT + Refresh Token.
        /// </summary>
        [HttpPost("2fa/verify")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> VerifyTwoFactor([FromBody] VerifyTwoFactorDto dto)
        {
            var response = await _authService.VerifyTwoFactorAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Toggle Two-Factor Authentication on/off for current user.
        /// </summary>
        [HttpPost("2fa/toggle")]
        [Authorize]
        public async Task<IActionResult> ToggleTwoFactor()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var enabled = await _authService.ToggleTwoFactorAsync(userId.Value);
            return Ok(new
            {
                success = true,
                twoFactorEnabled = enabled,
                message = enabled ? "تم تفعيل التحقق بخطوتين (2FA) بنجاح." : "تم تعطيل التحقق بخطوتين (2FA)."
            });
        }

        /// <summary>
        /// Send Email Confirmation token to user's email.
        /// </summary>
        [HttpPost("send-email-confirmation")]
        [AllowAnonymous]
        public async Task<IActionResult> SendEmailConfirmation([FromBody] ForgotPasswordDto dto)
        {
            await _authService.SendEmailConfirmationAsync(dto.Email);
            return Ok(new { success = true, message = "تم إرسال رمز تأكيد البريد الإلكتروني." });
        }

        /// <summary>
        /// Confirm email using the verification token.
        /// </summary>
        [HttpPost("confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
        {
            var success = await _authService.ConfirmEmailAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message = "رمز تأكيد البريد غير صالح أو منتهي الصلاحية." });
            }
            return Ok(new { success = true, message = "تم تأكيد البريد الإلكتروني بنجاح." });
        }

        /// <summary>
        /// Request Password Reset link / OTP code sent to email.
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _authService.ForgotPasswordAsync(dto);
            return Ok(new { success = true, message = "إذا كان هذا البريد مسجلاً لدينا، فقد تم إرسال رمز استعادة كلمة المرور إليه." });
        }

        /// <summary>
        /// Reset Password using the token received in email.
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var success = await _authService.ResetPasswordAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message = "رمز استعادة كلمة المرور غير صالح أو انتهت صلاحيته." });
            }
            return Ok(new { success = true, message = "تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة." });
        }

        /// <summary>
        /// Google OAuth Sign-In / Sign-Up.
        /// </summary>
        [HttpPost("google-login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            var response = await _authService.GoogleLoginAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Get currently logged in user info.
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<AuthUserDto>> GetMe()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var user = await _authService.GetUserByIdAsync(userId.Value);
            if (user == null) return NotFound(new { message = "المستخدم غير موجود." });

            return Ok(user);
        }
    }
}
