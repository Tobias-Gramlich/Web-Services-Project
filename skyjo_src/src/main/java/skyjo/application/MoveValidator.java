package skyjo.application;

import skyjo.domain.Action;
import skyjo.domain.ActionType;
import skyjo.domain.Card;

import java.util.List;
import java.util.Objects;

public class MoveValidator {
    public static boolean validateMove(Action action){
        // Validate if player is allowed to move
        if (!Objects.equals(action.getPlayer().getId(), action.getGame().getCurrentPlayer().getId())){
            return false;
        }

        ActionType actionType = action.getActionType();

        return switch (actionType) {
            case DRAW_FROM_DRAW_PILE -> validateDrawPile(action);
            case DRAW_FROM_DISCARD_PILE -> validateDiscardPile(action);
        };
    }

    private static boolean validateDrawPile(Action action){
        // Check if drawn Card is from Draw Pile
        if (!Objects.equals(action.getCard(), action.getGame().getDrawPile().getStack().peek())) return false;

        // Check if the Pile is from Draw Pile
        if (!action.isDrawPile()) return false;

        if (action.isNewCardInField()){
            // Check if exactly one position has changed card
            int count = 0;
            List<Card> cardsBefore = action.getPlayFieldBefore().getPlayField();
            List<Card> cardsAfter = action.getPlayFieldAfter().getPlayField();

            for (int i = 0; i < cardsBefore.size(); i++) {
                if (cardsBefore.get(i).getValue() != cardsAfter.get(i).getValue()) {
                    count++;
                }
            }

            if (count != 1) return false;
        }
        else {
            // Check if exactly one card has been revealed
            int count = 0;
            List<Card> cardsBefore = action.getPlayFieldBefore().getPlayField();
            List<Card> cardsAfter = action.getPlayFieldAfter().getPlayField();

            for (int i = 0; i < cardsBefore.size(); i++) {
                if (cardsBefore.get(i).isRevealed() != cardsAfter.get(i).isRevealed()) {
                    count++;
                }
            }

            if (count != 1) return false;
        }

        // Check if lastMove was played
        if (action.getPlayer().getLastMoveDone()) return false;

        return true;
    }

    private static boolean validateDiscardPile(Action action){
        // Check if drawn Card is from Discard Pile
        if (!Objects.equals(action.getCard(), action.getGame().getDiscardPile().getStack().peek())) return false;

        // Check if there is a new Card in Field
        if (!action.isNewCardInField()) return false;

        // Check if exactly one position has a new Card
        // Check if exactly one position has changed card
        int count = 0;
        List<Card> cardsBefore = action.getPlayFieldBefore().getPlayField();
        List<Card> cardsAfter = action.getPlayFieldAfter().getPlayField();

        for (int i = 0; i < cardsBefore.size(); i++) {
            if (cardsBefore.get(i).getValue() != cardsAfter.get(i).getValue()) {
                count++;
            }
        }

        if (count != 1) return false;

        // Check if it is the discard Pile
        if (action.isDrawPile()) return false;

        // Check if lastMove was played
        if (action.getPlayer().getLastMoveDone()) return false;


        return true;
    }
}
