package skyjo.domain;

import lombok.Getter;

@Getter
public class Action {
    private ActionType actionType;
    private PlayField playFieldBefore;
    private PlayField playFieldAfter;
    private boolean drawPile;
    private boolean newCardInField;
    private Card card;
    private Player player;
    private Game game;

    public Action (ActionType actionType, PlayField playFieldBefore, PlayField playFieldAfter, boolean drawPile, boolean newCardInField, Card card, Player player, Game game){
        this.actionType = actionType;
        this.playFieldBefore = playFieldBefore;
        this.playFieldAfter = playFieldAfter;
        this.drawPile = drawPile;
        this.newCardInField = newCardInField;
        this.card = card;
        this.player = player;
        this.game = game;
    }
}
