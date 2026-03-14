package skyjo.api.mapper;

import skyjo.api.dto.CardResponse;
import skyjo.api.dto.GameResponse;
import skyjo.api.dto.PlayFieldResponse;
import skyjo.api.dto.PlayerResponse;
import skyjo.domain.Card;
import skyjo.domain.Game;
import skyjo.domain.PlayField;
import skyjo.domain.Player;

import java.util.List;

public final class GameResponseMapper {

    private GameResponseMapper() {
    }

    public static GameResponse toResponse(Game game) {
        return new GameResponse(
                game.getId(),
                game.getPlayers().stream()
                        .map(GameResponseMapper::toResponse)
                        .toList(),
                game.getCurrentPlayerIndex(),
                game.getCurrentPlayer() != null ? game.getCurrentPlayer().getId() : null,
                game.getPhase() != null ? game.getPhase().name() : null,
                game.getRound()
        );
    }

    public static PlayerResponse toResponse(Player player) {
        return new PlayerResponse(
                player.getId(),
                toResponse(player.getPlayField()),
                player.getPoints(),
                player.getLastMoveDone()
        );
    }

    public static PlayFieldResponse toResponse(PlayField playField) {
        return new PlayFieldResponse(
                playField.getPlayField().stream()
                        .map(GameResponseMapper::toResponse)
                        .toList()
        );
    }

    public static CardResponse toResponse(Card card) {
        boolean revealed = card.isRevealed();

        return new CardResponse(
                revealed,
                revealed ? card.getValue() : null
        );
    }
}