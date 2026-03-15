package skyjo.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor(force = true)
public class PlayField {
    private List<Card> playField;
    public PlayField (List<Card> playField){
        this.playField = playField;
    }

    public Card switchCard(Card card, int x, int y){
        int position = calculatePosition(x, y);
        Card oldCard = playField.get(position);
        playField.remove(position);
        playField.set(position, card);
        return oldCard;
    }

    public Long calculateSum(){
        Long count = 0L;
        for (Card card : playField){
            if(card.isRevealed()){
                count = count + card.getValue();
            }
        }
        return count;
    }

    @JsonIgnore
    public int countRevealedCard(){
        int count = 0;
        for (Card card : playField){
            if (card.isRevealed()){
                count++;
            }
        }
        return count;
    }

    private int calculatePosition(int x, int y){
        return 4*x+y+1;
    }

    private Map<Character, Integer> calculateCoordinates(int z){
        Integer y = (z-1)%4;
        Integer x = (z-y-1)/4;
        HashMap<Character, Integer> hashMap = new HashMap<>();
        hashMap.put('x', x);
        hashMap.put('y', y);
        return hashMap;
    }
}
