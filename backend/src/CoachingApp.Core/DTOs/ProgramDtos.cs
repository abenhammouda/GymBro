namespace CoachingApp.Core.DTOs
{
    public class ProgramResponse
    {
        public int ProgramId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Draft"; // Active, Draft, Completed, Cancelled
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Duration { get; set; } // in weeks
        public int? CurrentWeek { get; set; }
        public string? CoverImageUrl { get; set; }
        public int CoachId { get; set; }
        public int ClientsAssigned { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateProgramRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Draft";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Duration { get; set; }
    }

    public class UpdateProgramRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Draft";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Duration { get; set; }
    }
}
