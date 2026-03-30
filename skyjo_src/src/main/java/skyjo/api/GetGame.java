package skyjo.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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

    @OPTIONS
    public Response options() {
        return Response.ok().build();
    }
}