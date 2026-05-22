using CoachingApp.Core.Enums;

namespace CoachingApp.Core.DTOs;

public record SupplementSetItemDto(
    int? SupplementSetItemId,
    string Name,
    decimal Quantity,
    string Unit,
    int OrderIndex
);

public record SupplementGroupDto(
    int? SupplementGroupId,
    string Name,
    int OrderIndex,
    List<SupplementSetItemDto> Items
);

public record SupplementSetResponse(
    int SupplementSetId,
    SupplementTiming Timing,
    int Index,
    int OrderIndex,
    List<SupplementGroupDto> Groups,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AddNextSupplementSetRequest(string Kind);

public record AddGroupRequest(string Name);

public record RenameGroupRequest(string Name);

public record UpdateGroupItemsRequest(List<SupplementSetItemDto> Items);
