package skyjo.infrastructure.persistence.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import infrastructure.jooq.generated.tables.records.ActionRecord;
import infrastructure.jooq.generated.tables.records.PlayerRecord;
import skyjo.domain.Action;
import skyjo.domain.Player;
import infrastructure.jooq.generated.tables.records.GameRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jooq.DSLContext;
import org.jooq.types.UInteger;
import com.fasterxml.jackson.databind.ObjectMapper;

import skyjo.domain.Game;
import org.jooq.types.ULong;
import skyjo.infrastructure.persistence.mapper.GameMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static infrastructure.jooq.generated.Tables.*;

@ApplicationScoped
public class GameJooqRepository implements IGameRepository {
    @Inject
    DSLContext dsl;

    @Inject
    GameMapper gameMapper;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    @Transactional
    public Game insertNewGame(Game game) throws JsonProcessingException {
        // 1) insert or update all players
        int i = 0;
        for (Player p : game.getPlayers()) {
            insertNewPlayer(p, i);
            i++;
        }

        // 2) insert game without current_player_id
        GameRecord record = dsl.insertInto(GAME)
                .set(GAME.NUMBER_OF_PLAYERS, UInteger.valueOf(game.getPlayers().size()))
                .set(GAME.ROUND, UInteger.valueOf(game.getRound()))
                .returning(GAME.ID)
                .fetchOne();

        if (record == null) {
            throw new IllegalStateException("Game insert failed.");
        }

        Long gameId = record.getId().longValue();
        game.setId(gameId);

        // 3) link players to game
        for (Player p : game.getPlayers()) {
            enterGame(game, p);
        }

        // 4) resolve current player from the actual players list
        Player currentPlayer = game.getPlayers().get(0); // because constructor starts with index 0

        // 5) verify player row really exists in DB
        boolean currentPlayerExists = dsl.fetchExists(
                dsl.selectOne()
                        .from(PLAYER)
                        .where(PLAYER.ID.eq(ULong.valueOf(currentPlayer.getId())))
        );

        if (!currentPlayerExists) {
            throw new IllegalStateException(
                    "Current player with ID " + currentPlayer.getId() + " does not exist in PLAYER table."
            );
        }

        // 6) update current_player_id only after verification
        dsl.update(GAME)
                .set(GAME.CURRENT_PLAYER_ID, ULong.valueOf(currentPlayer.getId()))
                .where(GAME.ID.eq(ULong.valueOf(gameId)))
                .execute();

        updateGameSnapshot(game);
        return game;
    }
    // auth needs to send id before persistence to work out
    // only inserts player if it does not exist yet otherwise it updates the currentgameid
    @Override
    public void insertNewPlayer(Player player, int playerIndex) throws JsonProcessingException {
        boolean exists = dsl.fetchExists(
                dsl.selectOne()
                        .from(PLAYER)
                        .where(PLAYER.ID.eq(ULong.valueOf(player.getId())))
        );

        if (!exists) {
            dsl.insertInto(PLAYER)
                    .set(PLAYER.ID, ULong.valueOf(player.getId()))
                    .set(PLAYER.POINTS, ULong.valueOf(player.getPoints()))
                    .set(PLAYER.PLAYER_INDEX, UInteger.valueOf(playerIndex))
                    .set(PLAYER.IS_VERIFIED, (byte) 0)
                    .set(PLAYER.PLAYFIELD, mapper.writeValueAsBytes(player.getPlayField()))
                    .set(PLAYER.NUMBER_OF_MOVES, ULong.valueOf(0))
                    .set(PLAYER.LAST_MOVE, (byte) (player.getLastMoveDone() ? 1 : 0))
                    .execute();
        } else {
            updatePlayer(player, playerIndex);
        }
    }

    @Override
    public void updateGameSnapshot(Game game) throws JsonProcessingException {
        // create Snapshot-JSon
        dsl.update(GAME).set(GAME.SNAPSHOT, mapper.writeValueAsBytes(game)).where(GAME.ID.eq(ULong.valueOf(game.getId()))).execute();
    }

    @Override
    public void updatePlayer(Player player) throws JsonProcessingException {
        dsl.update(PLAYER)
                .set(PLAYER.POINTS, ULong.valueOf(player.getPoints()))
                .set(PLAYER.IS_VERIFIED, (byte) 0)
                .set(PLAYER.PLAYFIELD, mapper.writeValueAsBytes(player.getPlayField()))
                .set(PLAYER.NUMBER_OF_MOVES, ULong.valueOf(0))
                .set(PLAYER.LAST_MOVE, (byte) (player.getLastMoveDone() ? 1 : 0))
                .where(PLAYER.ID.eq(ULong.valueOf(player.getId())))
                .execute();
    }

    @Override
    public void updatePlayer(Player player, Integer playerIndex) throws JsonProcessingException {
        dsl.update(PLAYER)
                .set(PLAYER.POINTS, ULong.valueOf(player.getPoints()))
                .set(PLAYER.PLAYER_INDEX, UInteger.valueOf(playerIndex))
                .set(PLAYER.IS_VERIFIED, (byte) 0)
                .set(PLAYER.PLAYFIELD, mapper.writeValueAsBytes(player.getPlayField()))
                .set(PLAYER.NUMBER_OF_MOVES, ULong.valueOf(0))
                .set(PLAYER.LAST_MOVE, (byte) (player.getLastMoveDone() ? 1 : 0))
                .where(PLAYER.ID.eq(ULong.valueOf(player.getId())))
                .execute();
    }



    @Override
    public void insertAction(Game game, Action action) throws JsonProcessingException {
        dsl.insertInto(ACTION)
                .set(ACTION.GAME_ID, ULong.valueOf(game.getId()))
                .set(ACTION.PLAYER_ID, ULong.valueOf(action.getPlayer().getId()))
                .set(ACTION.ACTION_ID, ULong.valueOf(game.getMoveCounter()))
                .set(ACTION.FIELD_BEFORE, mapper.writeValueAsString(action.getPlayFieldBefore()))
                .set(ACTION.FIELD_AFTER, mapper.writeValueAsString(action.getPlayFieldAfter()))
                .set(ACTION.ACTION_TYPE, mapper.writeValueAsString(action.getActionType()))
                .execute();
    }

    @Override
    public void enterGame(Game game, Player player) {
    dsl.update(PLAYER)
            .set(PLAYER.CURRENT_GAME_ID, ULong.valueOf(game.getId()))
            .where(PLAYER.ID.eq(ULong.valueOf(player.getId())))
            .execute();
    }

    @Override
    public void setVerified(Player player) {
        dsl.update(PLAYER).set(PLAYER.IS_VERIFIED, (byte) 1).where(PLAYER.ID.eq(ULong.valueOf(player.getId()))).execute();
    }

    @Override
    public boolean isVerified(Player p) {
        return dsl.fetchExists(
                dsl.selectOne()
                        .from(PLAYER)
                        .where(PLAYER.ID.eq(ULong.valueOf(p.getId())))
                        .and(PLAYER.IS_VERIFIED.ne((byte) 0))
        );
    }

    @Override
    public List<Action> getAllActions(Game game) {
        List<ActionRecord> records = dsl
                .selectFrom(ACTION)
                .where(ACTION.GAME_ID.eq(ULong.valueOf(game.getId())))
                .fetchInto(ActionRecord.class);

        List<Action> actions = new ArrayList<>();

        for (ActionRecord record : records) {
            Action action = gameMapper.toDomain(record); // deine Mapper-Methode
            actions.add(action);
        }

        return actions;
    }

    @Override
    public Game getGame(Long player_id) {
        Long game_id = Objects.requireNonNull(dsl.selectFrom(PLAYER).where(PLAYER.ID.eq(ULong.valueOf(player_id))).fetchOne(PLAYER.CURRENT_GAME_ID)).longValue();
        return getGameById(game_id);
    }

    @Override
    public Game getGameById(Long game_id) {
        GameRecord g = dsl.selectFrom(GAME).where(GAME.ID.eq(ULong.valueOf(game_id))).fetchOneInto(GameRecord.class);
        if (g == null) return null;
        return gameMapper.toDomainGame(g);
    }

    @Override
    public Player getPlayer(Long player_id) {
        PlayerRecord p = dsl.selectFrom(PLAYER).where(PLAYER.ID.eq(ULong.valueOf(player_id))).fetchOneInto(PlayerRecord.class);
        assert p != null;
        return gameMapper.toDomainPlayer(p);
    }

    @Override
    public List<Player> getPlayers(Long game_id) {
        Game g = getGameById(game_id);
        List<Player> players = new ArrayList<>();
        for (Player player : g.getPlayers()) {
            players.add(getPlayer(player.getId()));
        }
        return players;
    }

    @Override
    public Action getAction(Long action_id, Long game_id) {
        ActionRecord a = dsl.selectFrom(ACTION).where(ACTION.ACTION_ID.eq(ULong.valueOf(action_id))).and(ACTION.GAME_ID.eq(ULong.valueOf(game_id))).fetchOneInto(ActionRecord.class);
        assert a != null;
        return gameMapper.toDomain(a);
    }
}
