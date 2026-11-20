using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebCarWash.Application.Interfaces;

namespace WebCarWash.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            var smtpSection = _configuration.GetSection("Smtp");
            var smtpHost = smtpSection["Host"];
            var smtpPort = int.TryParse(smtpSection["Port"], out var port) ? port : 587;
            var smtpUser = smtpSection["Username"];
            var smtpPass = smtpSection["Password"];
            var fromEmail = smtpSection["FromEmail"] ?? "no-reply@eghselha.com";

            // If real SMTP credentials are provided, attempt delivery
            if (!string.IsNullOrWhiteSpace(smtpHost) && !string.IsNullOrWhiteSpace(smtpUser))
            {
                try
                {
                    using var client = new SmtpClient(smtpHost, smtpPort)
                    {
                        Credentials = new NetworkCredential(smtpUser, smtpPass),
                        EnableSsl = true
                    };

                    var mailMessage = new MailMessage(fromEmail, toEmail, subject, htmlMessage)
                    {
                        IsBodyHtml = true
                    };

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation("Email sent successfully to {ToEmail} with subject '{Subject}'", toEmail, subject);
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send email via SMTP to {ToEmail}. Falling back to logger.", toEmail);
                }
            }

            // In development or when SMTP is not configured, log clearly for testing and demonstration
            _logger.LogInformation("\n================== [EGHSELHA EMAIL SERVICE SIMULATION] ==================\n" +
                                   "TO: {ToEmail}\n" +
                                   "SUBJECT: {Subject}\n" +
                                   "BODY:\n{Body}\n" +
                                   "=========================================================================\n",
                                   toEmail, subject, htmlMessage);

            await Task.CompletedTask;
        }
    }
}
