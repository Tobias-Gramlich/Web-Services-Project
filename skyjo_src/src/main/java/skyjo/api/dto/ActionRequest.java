package skyjo.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import skyjo.domain.ActionType;

@Data
@NoArgsConstructor // Required for Jackson to prevent the errors we saw earlier
public class ActionRequest {
    private long gameId;
    private String playerToken;

    // The type of action (e.g., DRAW_FROM_PILE, DISCARD, REVEAL)
    private ActionType actionType;

    // Which card in the player's 3x4 grid is being targeted (0-11)
    private Integer cardIndex;

    // Whether they are interacting with the Draw Pile or Discard Pile
    private boolean fromDrawPile;

    // If the move involves choosing to keep a card or not
    private boolean keepCard;
}