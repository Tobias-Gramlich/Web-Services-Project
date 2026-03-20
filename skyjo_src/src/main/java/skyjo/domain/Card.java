package skyjo.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor(force = true)
public class Card {
    private final int value;
    @Setter
    private boolean revealed = false;

    public Card(int value) {
        this.value = value;
    }

    public void reveal(){
        revealed = true;
    }

    public void reset() {
        revealed = false;
    }
}
