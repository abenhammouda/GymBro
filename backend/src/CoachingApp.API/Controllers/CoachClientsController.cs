using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Infrastructure.Data;
using CoachingApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoachClientsController : ControllerBase
{
    private readonly CoachingDbContext _context;
    private readonly ILogger<CoachClientsController> _logger;
    private readonly MacroPlanService _macroPlanService;
    private readonly WeeklyProgressService _weeklyProgressService;

    public CoachClientsController(
        CoachingDbContext context,
        ILogger<CoachClientsController> logger,
        MacroPlanService macroPlanService,
        WeeklyProgressService weeklyProgressService)
    {
        _context = context;
        _logger = logger;
        _macroPlanService = macroPlanService;
        _weeklyProgressService = weeklyProgressService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoachClient([FromBody] CreateCoachClientRequest request)
    {
        try
        {
            var coach = await _context.Coaches.FindAsync(request.CoachId);
            if (coach == null) return NotFound(new { message = "Coach not found" });

            var adherent = await _context.Adherents.FindAsync(request.AdherentId);
            if (adherent == null) return NotFound(new { message = "Adherent not found" });

            var existing = await _context.CoachClients
                .FirstOrDefaultAsync(cc => cc.CoachId == request.CoachId && cc.AdherentId == request.AdherentId);
            if (existing != null)
                return BadRequest(new { message = "Coach-Client relationship already exists" });

            var coachClient = new CoachClient
            {
                CoachId = request.CoachId,
                AdherentId = request.AdherentId,
                Status = CoachClientStatus.Active,
                StartDate = DateTime.UtcNow,
                GoalSummary = request.GoalSummary,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.CoachClients.Add(coachClient);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                coachClientId = coachClient.CoachClientId,
                coachId = coachClient.CoachId,
                adherentId = coachClient.AdherentId,
                status = coachClient.Status.ToString(),
                message = "Coach-Client relationship created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CoachClient relationship");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetCoachClients()
    {
        try
        {
            var coachClients = await _context.CoachClients
                .Include(cc => cc.Coach)
                .Include(cc => cc.Adherent)
                .Select(cc => new
                {
                    cc.CoachClientId,
                    cc.CoachId,
                    CoachName = cc.Coach.Name,
                    cc.AdherentId,
                    AdherentName = cc.Adherent.Name,
                    Status = cc.Status.ToString(),
                    cc.StartDate,
                    cc.GoalSummary
                })
                .ToListAsync();

            return Ok(coachClients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting CoachClients");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Retourne les clients du coach connecté, filtrés par statut.
    /// ?status=Active | Paused | Inactive | (vide = tous)
    /// </summary>
    [HttpGet("my-clients")]
    public async Task<IActionResult> GetMyClients([FromQuery] string? status = null)
    {
        try
        {
            var coachIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (coachIdClaim == null) return Unauthorized();
            var coachId = int.Parse(coachIdClaim.Value);

            var query = _context.CoachClients
                .Include(cc => cc.Adherent)
                .Where(cc => cc.CoachId == coachId);

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<CoachClientStatus>(status, true, out var statusEnum))
                query = query.Where(cc => cc.Status == statusEnum);

            var clients = await query
                .Select(cc => new ClientSummaryDto
                {
                    CoachClientId = cc.CoachClientId,
                    AdherentId = cc.Adherent.AdherentId,
                    AdherentName = cc.Adherent.Name,
                    AdherentEmail = cc.Adherent.Email,
                    ProfilePicture = cc.Adherent.ProfilePicture,
                    Age = cc.Adherent.DateOfBirth.HasValue
                        ? DateTime.UtcNow.Year - cc.Adherent.DateOfBirth.Value.Year
                        : null,
                    Status = cc.Status.ToString(),
                    StartDate = cc.StartDate,
                    EndDate = cc.EndDate,
                    GoalSummary = cc.GoalSummary,
                    LastWeight = cc.Adherent.InitialWeight
                })
                .ToListAsync();

            return Ok(clients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting coach's clients");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Profil complet d'un client : infos intake, progrès hebdo, macros.
    /// </summary>
    [HttpGet("{coachClientId}/profile")]
    public async Task<IActionResult> GetClientProfile(int coachClientId)
    {
        try
        {
            var cc = await _context.CoachClients
                .Include(c => c.Adherent)
                    .ThenInclude(a => a.IntakePhotos)
                .FirstOrDefaultAsync(c => c.CoachClientId == coachClientId);

            if (cc == null) return NotFound(new { message = "Client introuvable" });

            var adherent = cc.Adherent;
            var age = adherent.DateOfBirth.HasValue
                ? DateTime.UtcNow.Year - adherent.DateOfBirth.Value.Year : (int?)null;

            var currentMacros = await _macroPlanService.GetCurrentMacroPlanAsync(coachClientId);
            var weeklyProgress = await _weeklyProgressService.GetWeeklyProgressAsync(coachClientId);

            var profile = new ClientProfileDto
            {
                CoachClientId = coachClientId,
                Status = cc.Status.ToString(),
                StartDate = cc.StartDate,
                EndDate = cc.EndDate,
                GoalSummary = cc.GoalSummary,
                Notes = cc.Notes,
                InactiveReason = cc.InactiveReason,
                CurrentMacroPlan = currentMacros,
                WeeklyProgress = weeklyProgress,
                Adherent = new AdherentIntakeDto
                {
                    AdherentId = adherent.AdherentId,
                    Name = adherent.Name,
                    Email = adherent.Email,
                    ProfilePicture = adherent.ProfilePicture,
                    Age = age,
                    Gender = adherent.Gender,
                    Height = adherent.Height,
                    InitialWeight = adherent.InitialWeight,
                    WorkNature = adherent.WorkNature?.ToString(),
                    GoalType = adherent.GoalType?.ToString(),
                    IntakePhotos = adherent.IntakePhotos.Select(p => new IntakePhotoDto
                    {
                        IntakePhotoId = p.IntakePhotoId,
                        PhotoUrl = p.PhotoUrl,
                        PhotoType = p.PhotoType.ToString()
                    }).ToList()
                }
            };

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting client profile {CoachClientId}", coachClientId);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }

    /// <summary>
    /// Le coach change le statut d'un client (Actif / En Pause / Inactif).
    /// </summary>
    [HttpPatch("{coachClientId}/status")]
    public async Task<IActionResult> UpdateClientStatus(int coachClientId, [FromBody] UpdateClientStatusRequest request)
    {
        try
        {
            var cc = await _context.CoachClients.FindAsync(coachClientId);
            if (cc == null) return NotFound(new { message = "Client introuvable" });

            if (!Enum.TryParse<CoachClientStatus>(request.Status, true, out var newStatus))
                return BadRequest(new { message = "Statut invalide. Valeurs acceptées: Active, Paused, Inactive" });

            cc.Status = newStatus;
            if (newStatus == CoachClientStatus.Inactive)
            {
                cc.InactiveReason = request.InactiveReason;
                cc.EndDate = request.EndDate ?? DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Statut mis à jour", status = cc.Status.ToString() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating client status {CoachClientId}", coachClientId);
            return StatusCode(500, new { message = "Erreur interne" });
        }
    }
}

public class CreateCoachClientRequest
{
    public int CoachId { get; set; }
    public int AdherentId { get; set; }
    public string? GoalSummary { get; set; }
    public string? Notes { get; set; }
}

