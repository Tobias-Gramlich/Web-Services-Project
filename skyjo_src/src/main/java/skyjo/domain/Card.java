package skyjo.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(force = true)
public class Card {
    private final int value;
    private boolean revealed = false;

    public Card(int value) {
        this.value = value;
    }

    public void reveal(){
        revealed = true;
    }
}
