using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Infrastructure.Data;
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

    public CoachClientsController(CoachingDbContext context, ILogger<CoachClientsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoachClient([FromBody] CreateCoachClientRequest request)
    {
        try
        {
            // Check if coach exists
            var coach = await _context.Coaches.FindAsync(request.CoachId);
            if (coach == null)
                return NotFound(new { message = "Coach not found" });

            // Check if adherent exists
            var adherent = await _context.Adherents.FindAsync(request.AdherentId);
            if (adherent == null)
                return NotFound(new { message = "Adherent not found" });

            // Check if relationship already exists
            var existing = await _context.CoachClients
                .FirstOrDefaultAsync(cc => cc.CoachId == request.CoachId && cc.AdherentId == request.AdherentId);

            if (existing != null)
                return BadRequest(new { message = "Coach-Client relationship already exists" });

            // Create relationship
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

            _logger.LogInformation($"Created CoachClient relationship: Coach {request.CoachId} - Adherent {request.AdherentId}");

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

    [HttpGet("my-clients")]
    public async Task<IActionResult> GetMyClients()
    {
        try
        {
            var coachIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (coachIdClaim == null)
            {
                return Unauthorized();
            }

            var coachId = int.Parse(coachIdClaim.Value);

            var clients = await _context.CoachClients
                .Include(cc => cc.Adherent)
                .Where(cc => cc.CoachId == coachId && cc.Status == CoachClientStatus.Active)
                .Select(cc => new
                {
                    adherentId = cc.Adherent.AdherentId,
                    name = cc.Adherent.Name,
                    email = cc.Adherent.Email,
                    phoneNumber = cc.Adherent.PhoneNumber,
                    profilePicture = cc.Adherent.ProfilePicture,
                    age = cc.Adherent.DateOfBirth.HasValue 
                        ? DateTime.UtcNow.Year - cc.Adherent.DateOfBirth.Value.Year 
                        : (int?)null,
                    goal = cc.GoalSummary
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
}

public class CreateCoachClientRequest
{
    public int CoachId { get; set; }
    public int AdherentId { get; set; }
    public string? GoalSummary { get; set; }
    public string? Notes { get; set; }
}
