using CoachingApp.Core.Entities;

namespace CoachingApp.Core.Interfaces;

public interface IProgramTemplateRepository
{
    Task<IEnumerable<ProgramTemplate>> GetProgramTemplatesByCoachIdAsync(int coachId, string? status = null);
    Task<ProgramTemplate?> GetProgramTemplateByIdAsync(int programTemplateId);
    Task<ProgramTemplate> AddProgramTemplateAsync(ProgramTemplate programTemplate);
    Task UpdateProgramTemplateAsync(ProgramTemplate programTemplate);
    Task DeleteProgramTemplateAsync(int programTemplateId);
    Task<int> GetClientsAssignedCountAsync(int programTemplateId);
}
