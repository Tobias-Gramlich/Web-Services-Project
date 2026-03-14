package skyjo.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

@ApplicationScoped
public class GameUpsetter {
    @Inject
    GameJooqRepository repo;

    // player are authenticated in order to use id
    public Game setUpGame(List<Long> players) throws JsonProcessingException {
        if (players.size() == 1 || players.isEmpty()) {
            throw new IllegalArgumentException();
        }
        // initialize draw pile
        Pile drawPile = Pile.createDrawPile();
        Stack<Card> drawnCards = new Stack<>();

        // initialize playfields from players
        List<Player> player = new ArrayList<>();
        for (Long id : players) {
            List<Card> cards = new ArrayList<>();
            for (int i = 0; i < 12; i++) {
                cards.add(drawPile.getStack().pop());
            }
            PlayField pl = new PlayField(cards);
            player.add(new Player(id, pl));
        }

        drawnCards.push(drawPile.draw());
        Pile discardPile = new Pile(drawnCards, true);

        // sets up game that can be used to insert new game into database
        Game game = new Game(player, drawPile, discardPile);
        game.setPhase(Status.SETUP);
        game.setCurrentPlayer(player.get(0));
        // insert Game into database and return game with correct id
        Game savedGame = repo.insertNewGame(game);
        return savedGame;
    }
}
