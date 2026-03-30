package skyjo.application;

import com.arjuna.ats.txoj.common.txojPropertyManager;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
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
        if (players == null || players.size() < 1) {
            throw new IllegalArgumentException("A game requires at least 2 players.");
        }

        if (players.size() > 4) {
            throw new IllegalArgumentException("A game requires at most 4 players.");
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



        //insert game into db to get gameid
        repo.insertNewGame(game);

        //initialise first move
        repo.initialise_move(game);

        // Set Game Phase to round since it is properly initialised now
        game.setPhase(Status.ROUNDS, repo);

        // Insert game into database and return saved game
        return game;
    }

    public void roundSetUp(Game game) throws JsonProcessingException {
        game.setPhase(Status.SETUP, repo);
        repo.updateGameSnapshot(game);


        // Initialize draw pile
        Pile drawPile = Pile.createDrawPile();

        // Initialize play fields for players
        game.getPlayers().forEach(player -> {
            List<Card> cards = IntStream.range(0, 12)
                    .mapToObj(i -> {
                        Card card = drawPile.draw();
                        card.reset();
                        return card;
                    })
                    .toList();
            player.setLastMoveDone(false);
            player.setPlayField(new PlayField(cards));
            
        });

        // Initialize discard pile with first card from draw pile
        Stack<Card> discardCards = new Stack<>();
        discardCards.push(drawPile.draw());
        Pile discardPile = new Pile(discardCards, true);

        // set attributes of game
        game.setDrawPile(drawPile);
        game.setDiscardPile(discardPile);

        //  Reveal two random cards for each player
        Random random = new Random();
        for (Player player : game.getPlayers()) {
            List<Card> cards = player.getPlayField().getPlayField();
            List<Integer> indices = new ArrayList<>(List.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11));
            Collections.shuffle(indices, random);
            cards.get(indices.get(0)).reveal();
            cards.get(indices.get(1)).reveal();
        }

        // Find the player with the highest sum of revealed cards
        Player startingPlayer = game.getPlayers().stream()
                .max(Comparator.comparingLong(p -> p.getPlayField().calculateSum()))
                .orElse(game.getPlayers().getFirst());

        // Set that player as current player
        game.setCurrentPlayer(startingPlayer);

        game.setPhase(Status.ROUNDS, repo);
        repo.updateGameSnapshot(game);

        game.getPlayers().forEach(player -> {
            try {
                repo.updatePlayer(player);
            } catch (JsonProcessingException e) {
                return;
            }
        });
        
        //initialise first move
        repo.initialise_move(game);
    }
}