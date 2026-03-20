package skyjo.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor(force = true)
public class Player {
    private final Long id;
    @Setter
    private PlayField playField;
    private Long points;
    private boolean lastMoveDone;

    public Player (Long id, PlayField playField){
        this.id = id;
        this.playField = playField;
        this.points = 0L;
        this.lastMoveDone = false;
    }

    public Player (Long id, PlayField playField, Long points, boolean lastMoveDone){
        this.id = id;
        this.playField = playField;
        this.points = points;
        this.lastMoveDone = lastMoveDone;
    }

    public void addPoints (Long points){
        this.points = this.points + points;
    }

    public void playLastMove (){
        this.lastMoveDone = true;
    }

    public boolean getLastMoveDone (){
        return this.lastMoveDone;
    }

}
