package skyjo.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collections;
import java.util.Stack;

@Getter
@NoArgsConstructor(force = true)
public class Pile {
    @Setter
    private Stack<Card> stack;
    private final boolean revealed;

    public Pile (Stack<Card> stack, boolean revealed){
        this.stack = stack;
        this.revealed = revealed;
    }

    // Constructor that creates initial draw pile
    // Factory method for initial draw pile
    public static Pile createDrawPile() {
        Stack<Card> stack = new Stack<>();

        for (int z = 0; z < 10; z++) {
            stack.push(new Card(1));
            stack.push(new Card(2));
            stack.push(new Card(3));
            stack.push(new Card(4));
            stack.push(new Card(5));
            stack.push(new Card(6));
            stack.push(new Card(7));
            stack.push(new Card(8));
            stack.push(new Card(9));
            stack.push(new Card(10));
            stack.push(new Card(11));
            stack.push(new Card(12));
            stack.push(new Card(-1));
            stack.push(new Card(0));
        }

        for (int y = 0; y < 5; y++) {
            stack.push(new Card(0));
            stack.push(new Card(-2));
        }

        Collections.shuffle(stack);
        return new Pile(stack, false);
    }

    public Card draw(){
        Card drawnCard = stack.pop();
        drawnCard.reveal();
        return drawnCard;
    }

    public Card showFristCard(){
        if (revealed){
            return stack.peek();
        }
        else {
            throw new IllegalMoveException("Cannot look at unrevealed pile");
        }
    }

    public void layCard(Card card){
        if (revealed) {
            stack.push(card);
        }
        else {
            throw new IllegalMoveException("Cannot lay card on unrevealed pile");
        }
    }
}
