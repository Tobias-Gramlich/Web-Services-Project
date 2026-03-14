package skyjo.api.dto;

import java.util.List;

public record PlayFieldResponse(
        List<CardResponse> cards
) {
}