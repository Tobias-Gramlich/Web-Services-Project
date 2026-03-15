package skyjo.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam; // Import this
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import skyjo.api.dto.GameResponse;
import skyjo.api.mapper.GameResponseMapper;
import skyjo.domain.Game;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

@Path("/getGame-{id}")
public class GetGame {
    @Inject
    GameJooqRepository repo;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public GameResponse getGame(@PathParam("id") String id) {
        Game game = repo.getGameById(Long.valueOf(id));
        // Now you can use the 'id' variable
        return GameResponseMapper.toResponse(game);
    }
}