package skyjo.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@ApplicationScoped
public class GameUpsetter {

    @Inject
    GameJooqRepository repo;

    // Players are authenticated in order to use their ids
    public Game setUpGame(List<Long> players) throws JsonProcessingException {
        if (players == null || players.size() < 2) {
            throw new IllegalArgumentException("A game requires at least 2 players.");
        }

        // Initialize draw pile
        Pile drawPile = Pile.createDrawPile();

        // Initialize play fields for players
        List<Player> playersInGame = players.stream()
                .map(id -> {
                    List<Card> cards = IntStream.range(0, 12)
                            .mapToObj(i -> {
                                Card card = drawPile.draw();
                                card.reset();
                                return card;
                            })
                            .collect(Collectors.toList());
                    return new Player(id, new PlayField(cards));
                })
                .collect(Collectors.toList());

        // Initialize discard pile with first card from draw pile
        Stack<Card> discardCards = new Stack<>();
        discardCards.push(drawPile.draw());
        Pile discardPile = new Pile(discardCards, true);

        // Create game object
        Game game = new Game(playersInGame, drawPile, discardPile);
        game.setPhase(Status.SETUP);

        // TODO: Reveal two cards for each player and determine who starts.

        //  Reveal two random cards for each player
        Random random = new Random();
        for (Player player : playersInGame) {
            List<Card> cards = player.getPlayField().getPlayField();
            List<Integer> indices = new ArrayList<>(List.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11));
            Collections.shuffle(indices, random);
            cards.get(indices.get(0)).reveal();
            cards.get(indices.get(1)).reveal();
        }

        // Find the player with the highest sum of revealed cards
        Player startingPlayer = playersInGame.stream()
                .max(Comparator.comparingLong(p -> p.getPlayField().calculateSum()))
                .orElse(playersInGame.getFirst());

        // Set that player as current player
        game.setCurrentPlayer(startingPlayer);

        // Set Game Phase to round since it is properly initialised now
        game.setPhase(Status.ROUNDS);

        // Insert game into database and return saved game
        return repo.insertNewGame(game);
    }
}