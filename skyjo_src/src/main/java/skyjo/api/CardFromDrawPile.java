package skyjo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import skyjo.api.dto.AuthTokenRequest;
import skyjo.api.wsconnector.GameConnectionRegistry;
import skyjo.domain.Game;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.Map;

@Path("/getCard/{id}")
public class CardFromDrawPile {
    @Inject
    GameJooqRepository repo;
    ObjectMapper mapper = new ObjectMapper();
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCard(@PathParam("id") Long id, AuthTokenRequest request) {
        Long playerId = 0L;
        // authenticate user
        try (Response authResponse = GameConnectionRegistry.authenticate(request.getToken())) {
            if (authResponse == null || authResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(Map.of("error", "Authentication failed"))
                        .build();
            }

            JsonNode jsonResponse = mapper.readTree(authResponse.getEntity().toString());

            if (!jsonResponse.get("success").asBoolean()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(Map.of("error", "Authentication failed"))
                        .build();
            }

            playerId = jsonResponse.get("userId").asLong();

        } catch (JsonProcessingException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Authentication response parsing failed"))
                    .build();
        }
        Game game = repo.getGameById(id);
        return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(game.drawFromDrawPile()).build();
    }
}