package skyjo.api.dto;

import java.util.List;

public record GameResponse(
        Long id,
        List<PlayerResponse> players,
        int currentPlayerIndex,
        Long currentPlayerId,
        String phase,
        int round
) {
}