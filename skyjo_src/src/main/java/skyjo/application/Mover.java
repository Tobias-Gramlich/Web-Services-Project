package skyjo.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

@ApplicationScoped
public class Mover {
    @Inject
    GameJooqRepository repo;

    public Game makeMove(Action action) throws JsonProcessingException {
        Game g = action.getGame();

        // lay Card
        g.getCurrentPlayer().setPlayField(action.getPlayFieldAfter());

        // check if last move
        if (g.isLastMove(g.getCurrentPlayer().getId())) {
            // reveal all cards
            PlayField playField = g.getCurrentPlayer().getPlayField();
            for (Card c : playField.getPlayField()) {
                c.reveal();
            }
            // set playField with all revealed cards
            g.getCurrentPlayer().setPlayField(playField);
        }

        if (g.getCurrentPlayer().getPlayField().countRevealedCard() == 12 ) {
            // set last Move = true
            g.getCurrentPlayer().playLastMove();

        }

        // update playfield in db
        repo.updatePlayer(g.getCurrentPlayer());

        //change current player
        g.changeCurrentPlayer();

        //check if he has last move already done in order to end round
        if (g.getCurrentPlayer().getLastMoveDone()) {
            g.setPhase(Status.END);
        }

        // update playfield in GameSnapshot
        repo.updateGameSnapshot(g);

        return g;
    }
}
