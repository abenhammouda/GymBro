using CoachingApp.Core.DTOs;

namespace CoachingApp.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterCoachAsync(RegisterCoachRequest request);
    Task<AuthResponse> RegisterAdherentAsync(RegisterAdherentRequest request);
    Task<bool> SendVerificationCodeAsync(string emailOrPhone, string userType);
    Task<AuthResponse> VerifyAndLoginAsync(VerifyCodeRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
}

public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string email, string code, string name);
    Task<bool> SendWelcomeEmailAsync(string email, string name);
}

public interface ISmsService
{
    Task<bool> SendVerificationSmsAsync(string phoneNumber, string code);
}

public interface ITokenService
{
    string GenerateAccessToken(int userId, string userType, string email);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
}
