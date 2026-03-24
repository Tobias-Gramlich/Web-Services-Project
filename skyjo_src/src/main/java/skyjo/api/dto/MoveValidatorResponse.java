package skyjo.api.dto;

public record MoveValidatorResponse(
        boolean valid,
        String errorMessage
) {
}
