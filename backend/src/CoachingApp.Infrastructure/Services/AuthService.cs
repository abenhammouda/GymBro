using BCrypt.Net;
using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ICoachRepository _coachRepository;
    private readonly IAdherentRepository _adherentRepository;
    private readonly CoachingDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ICoachRepository coachRepository,
        IAdherentRepository adherentRepository,
        CoachingDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        ISmsService smsService,
        ILogger<AuthService> logger)
    {
        _coachRepository = coachRepository;
        _adherentRepository = adherentRepository;
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _smsService = smsService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterCoachAsync(RegisterCoachRequest request)
    {
        // Validate that at least email or phone is provided
        if (string.IsNullOrEmpty(request.Email) && string.IsNullOrEmpty(request.PhoneNumber))
            throw new ArgumentException("Email or phone number is required");

        // Check if coach already exists
        if (!string.IsNullOrEmpty(request.Email))
        {
            var existingByEmail = await _coachRepository.GetByEmailAsync(request.Email);
            if (existingByEmail != null)
                throw new InvalidOperationException("A coach with this email already exists");
        }

        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            var existingByPhone = await _coachRepository.GetByPhoneAsync(request.PhoneNumber);
            if (existingByPhone != null)
                throw new InvalidOperationException("A coach with this phone number already exists");
        }

        // Create coach
        var coach = new Coach
        {
            Name = request.Name,
            Email = request.Email ?? string.Empty,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            Bio = request.Bio,
            Specialization = request.Specialization,
            VerificationCode = GenerateVerificationCode(),
            VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10)
        };

        await _coachRepository.AddAsync(coach);

        // Send verification code
        await SendVerificationCodeInternalAsync(coach);

        throw new InvalidOperationException("Please verify your account with the code sent to your email/phone");
    }

    public async Task<AuthResponse> RegisterAdherentAsync(RegisterAdherentRequest request)
    {
        // Check if adherent already exists
        var existing = await _adherentRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            throw new InvalidOperationException("An adherent with this email already exists");

        // Create adherent
        var adherent = new Adherent
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Height = request.Height,
            VerificationCode = GenerateVerificationCode(),
            VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10)
        };

        await _adherentRepository.AddAsync(adherent);

        // Send verification code
        await _emailService.SendVerificationEmailAsync(adherent.Email, adherent.VerificationCode!, adherent.Name);

        throw new InvalidOperationException("Please verify your account with the code sent to your email");
    }

    public async Task<bool> SendVerificationCodeAsync(string emailOrPhone, string userType)
    {
        if (userType == "Coach")
        {
            var coach = await _coachRepository.GetByEmailOrPhoneAsync(emailOrPhone);
            if (coach == null) return false;

            coach.VerificationCode = GenerateVerificationCode();
            coach.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);
            await _coachRepository.UpdateAsync(coach);

            await SendVerificationCodeInternalAsync(coach);
            return true;
        }
        else
        {
            var adherent = await _adherentRepository.GetByEmailAsync(emailOrPhone);
            if (adherent == null) return false;

            adherent.VerificationCode = GenerateVerificationCode();
            adherent.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);
            await _adherentRepository.UpdateAsync(adherent);

            await _emailService.SendVerificationEmailAsync(adherent.Email, adherent.VerificationCode!, adherent.Name);
            return true;
        }
    }

    public async Task<AuthResponse> VerifyAndLoginAsync(VerifyCodeRequest request)
    {
        if (request.UserType == "Coach")
        {
            var coach = await _coachRepository.GetByEmailOrPhoneAsync(request.EmailOrPhone);
            if (coach == null || coach.VerificationCode != request.VerificationCode)
                throw new UnauthorizedAccessException("Invalid verification code");

            if (coach.VerificationCodeExpiry < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Verification code has expired");

            // Mark as verified
            if (!string.IsNullOrEmpty(coach.Email) && coach.Email == request.EmailOrPhone)
                coach.IsEmailVerified = true;
            if (!string.IsNullOrEmpty(coach.PhoneNumber) && coach.PhoneNumber == request.EmailOrPhone)
                coach.IsPhoneVerified = true;

            coach.VerificationCode = null;
            coach.VerificationCodeExpiry = null;
            await _coachRepository.UpdateAsync(coach);

            // Generate tokens
            return await GenerateAuthResponseAsync(coach.CoachId, "Coach", coach.Email);
        }
        else
        {
            var adherent = await _adherentRepository.GetByEmailAsync(request.EmailOrPhone);
            if (adherent == null || adherent.VerificationCode != request.VerificationCode)
                throw new UnauthorizedAccessException("Invalid verification code");

            if (adherent.VerificationCodeExpiry < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Verification code has expired");

            adherent.IsEmailVerified = true;
            adherent.VerificationCode = null;
            adherent.VerificationCodeExpiry = null;
            await _adherentRepository.UpdateAsync(adherent);

            return await GenerateAuthResponseAsync(adherent.AdherentId, "Adherent", adherent.Email);
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        if (request.UserType == "Coach")
        {
            var coach = await _coachRepository.GetByEmailOrPhoneAsync(request.EmailOrPhone);
            if (coach == null || !BCrypt.Net.BCrypt.Verify(request.Password, coach.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            // Check if email/phone is verified
            bool isVerified = false;
            if (!string.IsNullOrEmpty(coach.Email) && coach.Email == request.EmailOrPhone)
                isVerified = coach.IsEmailVerified;
            else if (!string.IsNullOrEmpty(coach.PhoneNumber) && coach.PhoneNumber == request.EmailOrPhone)
                isVerified = coach.IsPhoneVerified;

            if (!isVerified)
                throw new UnauthorizedAccessException("Please verify your account before logging in. Check your email/phone for the verification code.");

            return await GenerateAuthResponseAsync(coach.CoachId, "Coach", coach.Email);
        }
        else
        {
            var adherent = await _adherentRepository.GetByEmailAsync(request.EmailOrPhone);
            if (adherent == null || !BCrypt.Net.BCrypt.Verify(request.Password, adherent.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            // Check if email is verified
            if (!adherent.IsEmailVerified)
                throw new UnauthorizedAccessException("Please verify your account before logging in. Check your email for the verification code.");

            return await GenerateAuthResponseAsync(adherent.AdherentId, "Adherent", adherent.Email);
        }
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.ExpiryDate > DateTime.UtcNow);

        if (token == null)
            throw new UnauthorizedAccessException("Invalid or expired refresh token");

        return await GenerateAuthResponseAsync(token.UserId, token.UserType.ToString(), "");
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
        if (token == null) return false;

        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(int userId, string userType, string email)
    {
        var accessToken = _tokenService.GenerateAccessToken(userId, userType, email);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = userId,
            UserType = userType == "Coach" ? Core.Enums.SenderType.Coach : Core.Enums.SenderType.Adherent,
            Token = refreshToken,
            ExpiryDate = DateTime.UtcNow.AddDays(7)
        };

        await _context.RefreshTokens.AddAsync(refreshTokenEntity);
        await _context.SaveChangesAsync();

        // Get user object
        object user;
        if (userType == "Coach")
            user = await _coachRepository.GetByIdAsync(userId) ?? new object();
        else
            user = await _adherentRepository.GetByIdAsync(userId) ?? new object();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600, // 1 hour
            User = user,
            UserType = userType
        };
    }

    private string GenerateVerificationCode()
    {
        return new Random().Next(100000, 999999).ToString();
    }

    private async Task SendVerificationCodeInternalAsync(Coach coach)
    {
        if (!string.IsNullOrEmpty(coach.Email))
        {
            await _emailService.SendVerificationEmailAsync(coach.Email, coach.VerificationCode!, coach.Name);
        }
        else if (!string.IsNullOrEmpty(coach.PhoneNumber))
        {
            await _smsService.SendVerificationSmsAsync(coach.PhoneNumber, coach.VerificationCode!);
        }
    }
}
