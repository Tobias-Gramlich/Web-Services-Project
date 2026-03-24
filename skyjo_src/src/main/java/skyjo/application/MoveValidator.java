package skyjo.application;

import skyjo.api.dto.MoveValidatorResponse;
import skyjo.domain.*;

import java.util.List;
import java.util.Objects;

public class MoveValidator {
    public static MoveValidatorResponse validateMove(Action action) {
        ActionType actionType = action.getActionType();
        Game game = action.getGame();
        Player player = action.getPlayer();
        boolean cardWasDrawn = game.getDrawPile().wasDrawnFrom();
        System.out.println("Was drawn: " + cardWasDrawn);

        // Check if it's the turn of the Player
        if (player.getId() != game.getCurrentPlayer().getId()) {
            return new MoveValidatorResponse(false, "Its not your turn");
        }

        // Check if Card is from Draw Pile
        if (actionType == ActionType.DRAW_FROM_DRAW_PILE && !action.isDrawPile()){
            return new MoveValidatorResponse(false, "Wrong Pile send");
        }

        // Check if Card is from Discard Pile
        if (actionType == ActionType.DRAW_FROM_DISCARD_PILE && action.isDrawPile()){
            return new MoveValidatorResponse(false, "Wrong Pile send");
        }

        // Check if GameState is Rounds
        if (game.getPhase() != Status.ROUNDS){
            return new MoveValidatorResponse(false, "Not playing Rounds");
        }

        // Check if a card was drawn
        if (actionType == ActionType.DRAW_FROM_DRAW_PILE && !action.getCard().isRevealed()){
            return new MoveValidatorResponse(false, "Must draw a card first");
        }

        // Check if Player has already drawn Card
        if (actionType == ActionType.DRAW_FROM_DISCARD_PILE && cardWasDrawn){
            return new MoveValidatorResponse(false, "Already drawn a Card");
        }

        // Check if he keeps Card when from Discard Pile
        if (actionType == ActionType.DRAW_FROM_DISCARD_PILE && !action.isNewCardInField()){
            return new MoveValidatorResponse(false, "Has to keep Card when drawn from Discard Pile");
        }

        return new MoveValidatorResponse(true, "");
    }
}
