package skyjo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import skyjo.domain.Card;
import skyjo.domain.Game;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

@Path("/getCard/{id}")
public class CardFromDrawPile {
    @Inject
    GameJooqRepository repo;

    //TODO: Authenticate User

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Card getCard(@PathParam("id") Long id) throws JsonProcessingException {
        Game game = repo.getGameById(id);
        Card card = game.getDrawPile().showFristCard();
        repo.updateGameSnapshot(game);
        return card;
    }
}