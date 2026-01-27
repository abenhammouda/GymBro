using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Enums;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CoachingApp.Infrastructure.Services;

public class ProgramTemplateService
{
    private readonly IProgramTemplateRepository _repository;
    private readonly string _uploadsPath;

    public ProgramTemplateService(IProgramTemplateRepository repository)
    {
        _repository = repository;
        
        var baseDirectory = Directory.GetCurrentDirectory();
        _uploadsPath = Path.Combine(baseDirectory, "uploads", "program-covers");
        
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<IEnumerable<ProgramResponse>> GetProgramTemplatesAsync(int coachId, string? status = null)
    {
        var templates = await _repository.GetProgramTemplatesByCoachIdAsync(coachId, status);
        var responses = new List<ProgramResponse>();

        foreach (var template in templates)
        {
            var clientsAssigned = await _repository.GetClientsAssignedCountAsync(template.ProgramTemplateId);
            responses.Add(MapToResponse(template, clientsAssigned));
        }

        return responses;
    }

    public async Task<ProgramResponse?> GetProgramTemplateByIdAsync(int programTemplateId)
    {
        var template = await _repository.GetProgramTemplateByIdAsync(programTemplateId);
        if (template == null) return null;

        var clientsAssigned = await _repository.GetClientsAssignedCountAsync(programTemplateId);
        return MapToResponse(template, clientsAssigned);
    }

    public async Task<ProgramResponse> CreateProgramTemplateAsync(int coachId, CreateProgramRequest request, IFormFile? imageFile)
    {
        var template = new ProgramTemplate
        {
            CoachId = coachId,
            Name = request.Name,
            Description = request.Description,
            Status = Enum.Parse<ProgramStatus>(request.Status),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Duration = request.Duration,
            CurrentWeek = 1
        };

        if (imageFile != null && imageFile.Length > 0)
        {
            var imageInfo = await SaveImageFileAsync(coachId, imageFile);
            template.CoverImageUrl = imageInfo.ImageUrl;
            template.CoverImageFileName = imageInfo.FileName;
        }

        var createdTemplate = await _repository.AddProgramTemplateAsync(template);
        return MapToResponse(createdTemplate, 0);
    }

    public async Task<ProgramResponse> UpdateProgramTemplateAsync(int programTemplateId, UpdateProgramRequest request, IFormFile? imageFile)
    {
        var template = await _repository.GetProgramTemplateByIdAsync(programTemplateId);
        if (template == null)
        {
            throw new KeyNotFoundException($"Program template with ID {programTemplateId} not found");
        }

        template.Name = request.Name;
        template.Description = request.Description;
        template.Status = Enum.Parse<ProgramStatus>(request.Status);
        template.StartDate = request.StartDate;
        template.EndDate = request.EndDate;
        template.Duration = request.Duration;

        if (imageFile != null && imageFile.Length > 0)
        {
            if (!string.IsNullOrEmpty(template.CoverImageFileName))
            {
                DeleteImageFile(template.CoverImageFileName);
            }

            var imageInfo = await SaveImageFileAsync(template.CoachId, imageFile);
            template.CoverImageUrl = imageInfo.ImageUrl;
            template.CoverImageFileName = imageInfo.FileName;
        }

        await _repository.UpdateProgramTemplateAsync(template);
        var clientsAssigned = await _repository.GetClientsAssignedCountAsync(programTemplateId);
        return MapToResponse(template, clientsAssigned);
    }

    public async Task DeleteProgramTemplateAsync(int programTemplateId)
    {
        var template = await _repository.GetProgramTemplateByIdAsync(programTemplateId);
        if (template != null && !string.IsNullOrEmpty(template.CoverImageFileName))
        {
            DeleteImageFile(template.CoverImageFileName);
        }

        await _repository.DeleteProgramTemplateAsync(programTemplateId);
    }

    private async Task<(string ImageUrl, string FileName)> SaveImageFileAsync(int coachId, IFormFile imageFile)
    {
        var coachDirectory = Path.Combine(_uploadsPath, $"coach_{coachId}");
        if (!Directory.Exists(coachDirectory))
        {
            Directory.CreateDirectory(coachDirectory);
        }

        var fileExtension = Path.GetExtension(imageFile.FileName);
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(coachDirectory, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await imageFile.CopyToAsync(stream);
        }

        var imageUrl = $"/uploads/program-covers/coach_{coachId}/{fileName}";
        return (imageUrl, fileName);
    }

    private void DeleteImageFile(string fileName)
    {
        try
        {
            var files = Directory.GetFiles(_uploadsPath, fileName, SearchOption.AllDirectories);
            foreach (var file in files)
            {
                File.Delete(file);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting image file: {ex.Message}");
        }
    }

    private ProgramResponse MapToResponse(ProgramTemplate template, int clientsAssigned)
    {
        return new ProgramResponse
        {
            ProgramId = template.ProgramTemplateId,
            Name = template.Name,
            Description = template.Description,
            Status = template.Status.ToString(),
            StartDate = template.StartDate,
            EndDate = template.EndDate,
            Duration = template.Duration,
            CurrentWeek = template.CurrentWeek,
            CoverImageUrl = template.CoverImageUrl,
            CoachId = template.CoachId,
            ClientsAssigned = clientsAssigned,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };
    }
}
