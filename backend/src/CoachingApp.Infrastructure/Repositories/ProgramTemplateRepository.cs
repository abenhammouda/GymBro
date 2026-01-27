using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Core.Interfaces;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Repositories;

public class ProgramTemplateRepository : IProgramTemplateRepository
{
    private readonly CoachingDbContext _context;

    public ProgramTemplateRepository(CoachingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProgramTemplate>> GetProgramTemplatesByCoachIdAsync(int coachId, string? status = null)
    {
        var query = _context.ProgramTemplates
            .Where(pt => pt.CoachId == coachId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ProgramStatus>(status, out var programStatus))
        {
            query = query.Where(pt => pt.Status == programStatus);
        }

        return await query
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }

    public async Task<ProgramTemplate?> GetProgramTemplateByIdAsync(int programTemplateId)
    {
        return await _context.ProgramTemplates
            .FirstOrDefaultAsync(pt => pt.ProgramTemplateId == programTemplateId);
    }

    public async Task<ProgramTemplate> AddProgramTemplateAsync(ProgramTemplate programTemplate)
    {
        _context.ProgramTemplates.Add(programTemplate);
        await _context.SaveChangesAsync();
        return programTemplate;
    }

    public async Task UpdateProgramTemplateAsync(ProgramTemplate programTemplate)
    {
        programTemplate.UpdatedAt = DateTime.UtcNow;
        _context.ProgramTemplates.Update(programTemplate);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteProgramTemplateAsync(int programTemplateId)
    {
        var programTemplate = await GetProgramTemplateByIdAsync(programTemplateId);
        if (programTemplate != null)
        {
            _context.ProgramTemplates.Remove(programTemplate);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetClientsAssignedCountAsync(int programTemplateId)
    {
        // This would count how many clients have this program assigned
        // For now, return 0 as we don't have the assignment table yet
        return await Task.FromResult(0);
    }
}
