package skyjo.application;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.*;

import static skyjo.domain.Status.SETUP;

@ApplicationScoped
public class DemoGameService {

    @Inject
    GameJooqRepository gameJooqRepository;

    public void createDemoGame() throws Exception {
        Card a = new Card(1);
        Card b = new Card(2);
        Card c = new Card(3);
        Card d = new Card(4);
        Card e = new Card(5);
        Card f = new Card(6);
        Card g = new Card(7);
        Card h = new Card(8);
        Card i = new Card(9);
        Card j = new Card(10);
        Card k = new Card(11);
        Card l = new Card(12);
        Card m = new Card(0);
        Card n = new Card(-1);
        Card o = new Card(-2);

        Stack<Card> stack = new Stack<>();
        for (int z = 0; z < 10; z++) {
            stack.push(a); stack.push(b); stack.push(c); stack.push(d);
            stack.push(e); stack.push(f); stack.push(g); stack.push(h);
            stack.push(i); stack.push(j); stack.push(k); stack.push(l);
            stack.push(n); stack.push(m);
        }
        for (int y = 0; y < 5; y++) {
            stack.push(m);
            stack.push(o);
        }

        Collections.shuffle(stack);

        Stack<Card> discardStack = new Stack<>();
        List<Card> playerA = new ArrayList<>();
        List<Card> playerB = new ArrayList<>();

        for (int z = 0; z < 12; z++) {
            playerA.add(stack.pop());
            playerB.add(stack.pop());
        }

        Player playerOne = new Player(1L, new PlayField(playerA));
        Player playerTwo = new Player(2L, new PlayField(playerB));

        List<Player> players = new ArrayList<>();
        players.add(playerOne);
        players.add(playerTwo);

        discardStack.push(stack.pop());
        Pile drawPile = new Pile(stack, false);
        Pile discardPile = new Pile(discardStack, true);

        Game game = new Game(players, drawPile, discardPile);
        game.setPhase(SETUP);

        gameJooqRepository.insertNewGame(game);
    }
}