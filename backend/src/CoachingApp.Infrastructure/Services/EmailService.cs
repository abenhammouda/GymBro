using SendGrid;
using SendGrid.Helpers.Mail;
using CoachingApp.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _apiKey = configuration["SendGrid:ApiKey"] ?? throw new InvalidOperationException("SendGrid ApiKey not configured");
        _fromEmail = configuration["SendGrid:FromEmail"] ?? "noreply@coachingapp.com";
        _fromName = configuration["SendGrid:FromName"] ?? "Coaching App";
    }

    public async Task<bool> SendVerificationEmailAsync(string email, string code, string name)
    {
        try
        {
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(email, name);
            var subject = "Code de vérification - Coaching App";
            
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #333;'>Bienvenue {name} !</h2>
                        <p>Votre code de vérification est :</p>
                        <div style='background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                            {code}
                        </div>
                        <p style='color: #666;'>Ce code expire dans 10 minutes.</p>
                        <p style='color: #666; font-size: 12px;'>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
                    </div>
                </body>
                </html>";

            var plainTextContent = $"Bonjour {name},\n\nVotre code de vérification est : {code}\n\nCe code expire dans 10 minutes.";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Verification email sent successfully to {email}");
                return true;
            }
            else
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                _logger.LogError($"Failed to send email to {email}. Status: {response.StatusCode}, Body: {responseBody}");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending verification email to {email}");
            return false;
        }
    }

    public async Task<bool> SendWelcomeEmailAsync(string email, string name)
    {
        try
        {
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(email, name);
            var subject = "Bienvenue sur Coaching App !";
            
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #333;'>Bienvenue {name} !</h2>
                        <p>Votre compte a été créé avec succès.</p>
                        <p>Vous pouvez maintenant vous connecter et commencer votre parcours de coaching.</p>
                        <p style='margin-top: 30px;'>À bientôt,<br>L'équipe Coaching App</p>
                    </div>
                </body>
                </html>";

            var plainTextContent = $"Bienvenue {name} !\n\nVotre compte a été créé avec succès.\n\nÀ bientôt,\nL'équipe Coaching App";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending welcome email to {email}");
            return false;
        }
    }
}
