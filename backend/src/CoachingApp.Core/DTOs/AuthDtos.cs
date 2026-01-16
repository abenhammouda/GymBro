namespace CoachingApp.Core.DTOs;

public class RegisterCoachRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Specialization { get; set; }
}

public class RegisterAdherentRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public decimal? Height { get; set; }
}

public class LoginRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string UserType { get; set; } = "Coach"; // Coach or Adherent
}

public class VerifyCodeRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string VerificationCode { get; set; } = string.Empty;
    public string UserType { get; set; } = "Coach";
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public object User { get; set; } = null!;
    public string UserType { get; set; } = string.Empty;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class SendVerificationCodeRequest
{
    public string EmailOrPhone { get; set; } = string.Empty;
    public string UserType { get; set; } = "Coach";
}
