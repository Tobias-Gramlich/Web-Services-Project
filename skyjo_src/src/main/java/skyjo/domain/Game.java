package skyjo.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.bytebuddy.pool.TypePool;
import skyjo.api.dto.ActionRequest;

import java.util.*;

@Getter
@NoArgsConstructor(force = true)
public class Game {
    @Setter
    private Long id;
    private final List<Player> players;
    private int currentPlayerIndex;
    @Setter
    private Status phase;
    private final Pile drawPile;
    private final Pile discardPile;
    @Setter
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
        return players.get(currentPlayerIndex -1).getLastMoveDone();
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
        PlayField before = player.getPlayField();

        // logic to determine 'after' and 'card'
        Card card = null;
        if (request.isFromDrawPile()) {
            card = drawFromDrawPile();
        } else {
            card = drawFromDiscardPile();
        }
        int x = request.getCardIndex() / 4;
        int y = request.getCardIndex() % 4;
        assert discardPile != null;
        discardPile.layCard(player.getPlayField().switchCard(card, x, y));
        PlayField after = player.getPlayField();

        return new Action(
                ActionType.valueOf(String.valueOf(request.getActionType())),
                before,
                after,
                request.isFromDrawPile(),
                request.isKeepCard(),
                card,
                player,
                this
        );
    }

    // Map<Long, Long> mit <PlayerId, PointsFromRound>
    public void addPoints(Map<Long, Long> points) {
        for (Player player : players) {
            player.addPoints(points.get(player.getId()));
        }
    }

    public boolean checkIfEnd() {
        assert players != null;
        return players.stream()
                .anyMatch(player -> player.getPoints() == 100);
    }
}
