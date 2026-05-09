using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class WeeklyProgressService
{
    private readonly CoachingDbContext _context;

    public WeeklyProgressService(CoachingDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Soumet le progrès hebdomadaire d'un adhérent (poids + photos).
    /// </summary>
    public async Task<WeeklyProgressDto> SubmitWeeklyProgressAsync(
        int adherentId,
        SubmitWeeklyProgressRequest request)
    {
        // Récupérer le programId actif pour ce CoachClient
        var activeProgram = await _context.Programs
            .Where(p => p.CoachClientId == request.CoachClientId
                     && p.Status == ProgramStatus.Active)
            .OrderByDescending(p => p.StartDate)
            .FirstOrDefaultAsync();

        int programId = activeProgram?.ProgramId ?? 0;

        var report = new ProgressReport
        {
            ProgramId = programId,
            AdherentId = adherentId,
            CoachClientId = request.CoachClientId,
            WeekNumber = request.WeekNumber,
            ReportDate = DateTime.UtcNow,
            CurrentWeight = request.CurrentWeight,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProgressReports.Add(report);
        await _context.SaveChangesAsync();

        // Ajouter les photos
        foreach (var photo in request.Photos)
        {
            if (!Enum.TryParse<PhotoType>(photo.PhotoType, true, out var photoType))
                photoType = PhotoType.Front;

            _context.ProgressPhotos.Add(new ProgressPhoto
            {
                ProgressReportId = report.ProgressReportId,
                PhotoUrl = photo.PhotoUrl,
                PhotoType = photoType,
                UploadedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return await GetReportDtoAsync(report.ProgressReportId);
    }

    /// <summary>
    /// Retourne toutes les semaines de progrès pour un coach-client, ordonnées par semaine.
    /// </summary>
    public async Task<List<WeeklyProgressDto>> GetWeeklyProgressAsync(int coachClientId)
    {
        var reports = await _context.ProgressReports
            .Include(pr => pr.ProgressPhotos)
            .Where(pr => pr.CoachClientId == coachClientId)
            .OrderBy(pr => pr.WeekNumber)
            .ToListAsync();

        return reports.Select(MapToDto).ToList();
    }

    private async Task<WeeklyProgressDto> GetReportDtoAsync(int reportId)
    {
        var report = await _context.ProgressReports
            .Include(pr => pr.ProgressPhotos)
            .FirstOrDefaultAsync(pr => pr.ProgressReportId == reportId);
        return MapToDto(report!);
    }

    private static WeeklyProgressDto MapToDto(ProgressReport pr) => new()
    {
        ProgressReportId = pr.ProgressReportId,
        CoachClientId = pr.CoachClientId,
        WeekNumber = pr.WeekNumber,
        ReportDate = pr.ReportDate,
        CurrentWeight = pr.CurrentWeight,
        Notes = pr.Notes,
        Photos = pr.ProgressPhotos.Select(p => new ProgressPhotoDto
        {
            ProgressPhotoId = p.ProgressPhotoId,
            PhotoUrl = p.PhotoUrl,
            PhotoType = p.PhotoType.ToString()
        }).ToList()
    };
}
