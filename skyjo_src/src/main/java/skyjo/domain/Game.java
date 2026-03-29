package skyjo.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.inject.Inject;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.bytebuddy.pool.TypePool;
import skyjo.api.dto.ActionRequest;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor(force = true)

public class Game {
    private Long id;
    private final List<Player> players;
    private int currentPlayerIndex;
    private Status phase;
    private Pile drawPile;
    private Pile discardPile;
    private int round;
    private int moveCounter;

    public Game (List<Player> players, Pile drawPile, Pile discardPile){
        this.players = players;
        this.currentPlayerIndex = 0;
        this.drawPile = drawPile;
        this.discardPile = discardPile;
        this.round = 1;
        this.moveCounter = 0;
        this.phase = Status.SETUP;
    }

    public void setPhase(Status s, GameJooqRepository gameJooqRepository) {
        this.phase = s;
        gameJooqRepository.updateGameStatus(this);
        try {
            gameJooqRepository.updateGameSnapshot(this);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    public boolean isLastMove(Long playerId) {
        // check if current player is actually playing
        if (!playerId.equals(getCurrentPlayer().getId())) {
            throw new IllegalArgumentException("Player id is not the same as current player.");
        }
        // check if they already played their last move
        if(getCurrentPlayer().getLastMoveDone()) {
            throw new IllegalArgumentException("Player last move is already done");
        }
        // last move if player before has done their last move
        assert players != null;
        return players.get(Math.floorMod(currentPlayerIndex - 1, players.size())).getLastMoveDone();
    }

    // first player in list is admin, bc of matchmaking
    @JsonIgnore
    public Long getAdminId() {
        return getPlayers().getFirst().getId();
    }

    public Player getCurrentPlayer(){
        return players.get(currentPlayerIndex);
    }

    public void changeCurrentPlayer(){
        if (currentPlayerIndex == players.size() - 1){
            currentPlayerIndex = 0;
        }
        else {
            currentPlayerIndex++;
        }
        moveCounter++;
    }

    public Card drawFromDrawPile(){
        if (drawPile.getStack().isEmpty()) {
            reshufflePiles();
        }
        return drawPile.draw();
    }

    public Card drawFromDiscardPile(){
        return discardPile.draw();
    }

    public void reshufflePiles(){
        Card topCard = discardPile.draw();
        Collections.shuffle(discardPile.getStack());
        drawPile.setStack(discardPile.getStack());
        discardPile.setStack(new Stack<>());
        discardPile.layCard(topCard);
    }

    public void setCurrentPlayer(Player player) {
        for (int i = 0; i < Objects.requireNonNull(players).size(); i++) {
            if (players.get(i).getId().equals(player.getId())) {
                this.currentPlayerIndex = i;
                return;
            }
        }
        throw new IllegalArgumentException("Player is not part of this game.");
    }

    public Action createAction(ActionRequest request, Player player) {
        // 1. Snapshot the state BEFORE changes
        PlayField before = player.getPlayField().deepCopy();

        Card card;
        int row = request.getCardIndex() / 4;
        int col = request.getCardIndex() % 4;

        if (request.isFromDrawPile()) {
            card = drawFromDrawPile();

            if (request.isKeepCard()) {
                Card oldCard = player.getPlayField().switchCard(card, row, col);
                discardPile.layCard(oldCard);
            } else {
                discardPile.layCard(card);
                player.getPlayField().getCard(row, col).reveal();
            }

        } else {
            card = drawFromDiscardPile();
            // Must keep — rule is already enforced, no second branch needed
            Card discardCard = player.getPlayField().switchCard(card, row, col);
            discardPile.layCard(discardCard);
            player.getPlayField().getCard(row, col).reveal(); // ← don't forget to reveal!
        }

        // 2. Snapshot the state AFTER changes
        PlayField after = player.getPlayField().deepCopy();

        return new Action(
                ActionType.valueOf(request.getActionType().name()),
                before,
                after,
                request.isFromDrawPile(),
                request.isKeepCard(),
                card,
                player,
                this);
    }

    // Map<Long, Long> mit <PlayerId, PointsFromRound>
    public void addPoints(Map<Long, Long> points, GameJooqRepository gameJooqRepository) {
        for (Player player : players) {
            player.addPoints(points.get(player.getId()));
            try {
                gameJooqRepository.updatePlayer(player);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }
        try {
                gameJooqRepository.updateGameSnapshot(this);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
    }

    public boolean checkIfEnd() {
        assert players != null;
        return players.stream()
                .anyMatch(player -> player.getPoints() >= 100);
    }
}
