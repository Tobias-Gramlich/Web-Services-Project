package skyjo.infrastructure.persistence.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import infrastructure.jooq.generated.tables.records.ActionRecord;
import infrastructure.jooq.generated.tables.records.GameRecord;
import infrastructure.jooq.generated.tables.records.PlayerRecord;
import jakarta.enterprise.context.ApplicationScoped;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.nio.charset.StandardCharsets;

@ApplicationScoped
public class GameMapper implements IGameMapper {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GameJooqRepository repo = new GameJooqRepository();

    @Override
    public Action toDomain(ActionRecord a) {
        ActionType actionType = ActionType.valueOf(a.getActionType());
        PlayField before = toDomain(a.getFieldBefore());
        PlayField after = toDomain(a.getFieldAfter());
        boolean drawPile = a.getDrawpile() != 0;
        boolean newCardInField = a.getNewcardinfield() != 0;
        Card card = toDomainCard(a.getCard());
        Player player = repo.getPlayer(a.getPlayerId().longValue());
        Game game = repo.getGameById(a.getGameId().longValue());
        return new Action(actionType, before, after, drawPile, newCardInField, card, player, game);
    }

    @Override
    public Card toDomainCard(String cardJson) {
        try {
            return objectMapper.readValue(cardJson, Card.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not deserialize PlayField JSON", e);
        }

    }

    @Override
    public Player toDomainPlayer(PlayerRecord p) {
        PlayField pf = toDomain(new String(p.getPlayfield(), StandardCharsets.UTF_8));
        boolean lastMove = pf.countRevealedCard() == 12;

        return new Player(p.getId().longValue(), pf, p.getPoints().longValue(), lastMove);
    }
    @Override
    public PlayField toDomain(String playfieldJson) {
        if (playfieldJson == null || playfieldJson.isBlank()) {
            return null; // Or return new PlayField() if you prefer a default
        }
        try {
            return objectMapper.readValue(playfieldJson, PlayField.class);
        } catch (JsonProcessingException e) {
            // Log the actual content to see WHAT failed
            System.err.println("Failed JSON Content: " + playfieldJson);
            throw new IllegalArgumentException("Could not deserialize PlayField JSON", e);
        }
    }
    @Override
    public Game toDomainGame(GameRecord g) {
        byte[] snapshot = g.getSnapshot();
        if (snapshot == null || snapshot.length == 0) {
            throw new IllegalArgumentException("Game snapshot is empty for ID: " + g.getId());
        }

        try {
            String json = new String(snapshot, StandardCharsets.UTF_8);
            return objectMapper.readValue(json, Game.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not deserialize Game JSON", e);
        }
    }
}
