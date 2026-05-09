using CoachingApp.Core.Enums;

namespace CoachingApp.Core.DTOs;

public record SupplementSetItemDto(
    int? SupplementSetItemId,
    string Name,
    decimal Quantity,
    string Unit,
    int OrderIndex
);

public record SupplementSetResponse(
    int SupplementSetId,
    SupplementTiming Timing,
    int Index,
    int OrderIndex,
    List<SupplementSetItemDto> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AddNextSupplementSetRequest(string Kind);

public record UpdateSupplementSetItemsRequest(List<SupplementSetItemDto> Items);
