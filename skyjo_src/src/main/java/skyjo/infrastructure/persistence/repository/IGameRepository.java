
package skyjo.infrastructure.persistence.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import skyjo.domain.Game;
import skyjo.domain.Player;
import skyjo.domain.Action;

import java.util.List;

public interface IGameRepository {
    // write in database
    public Game insertNewGame(Game game) throws JsonProcessingException;
    public void updateGameSnapshot(Game game) throws JsonProcessingException;
    // public void setGameStatus(Game game);
    public void insertAction(Game game, Action action) throws JsonProcessingException;
    public void enterGame(Game game, Player player);
    public void setVerified(Player player);
    public boolean isVerified(Player p);
    public void insertNewPlayer(Player player, int player_index) throws JsonProcessingException;

    // get from database
    public List<Action> getAllActions(Game game);
    public Game getGame(Long player_id);
    public Game getGameById(Long game_id);
    public Player getPlayer(Long player_id);
    public List<Player> getPlayers(Long game_id);
    public Action getAction(Long action_id, Long game_id);
}