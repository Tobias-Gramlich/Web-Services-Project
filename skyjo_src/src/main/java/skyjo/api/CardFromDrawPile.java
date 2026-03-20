package skyjo.api;

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

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Card getCard(@PathParam("id") Long id) {
        Game game = repo.getGameById(id);
        return game.drawFromDrawPile();
    }
}