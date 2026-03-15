package skyjo.api.dto;

public record PlayerResponse(
        Long id,
        PlayFieldResponse playField,
        Long points,
        boolean lastMoveDone
) {
}