package skyjo.api;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import skyjo.api.dto.ActionRequest;
import skyjo.application.MoveValidator;
import skyjo.domain.Action;
import skyjo.domain.Game;
import skyjo.domain.Player;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.Map;

@Path("/move")
@Consumes(MediaType.APPLICATION_JSON)
public class Move {
    @Inject
    GameJooqRepository repository;

    private static final Logger LOG = Logger.getLogger(SetUpPoint.class);

    @POST
    public Response validateMove(ActionRequest request) {
        LOG.info("Validating move request");
        // 1. Das Spiel aus dem Repository laden
        Game game = repository.getGameById(request.getGameId());
        if (game == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Game with ID " + request.getGameId() + " not found"))
                    .build();
        }

        // 2. Den Spieler laden
        Player player = repository.getPlayer(request.getPlayerId());
        if (player == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Player with ID " + request.getPlayerId() + " not found"))
                    .build();
        }

        // 3. Action erstellen und validieren
        Action a = game.createAction(request, player);
        boolean valid = MoveValidator.validateMove(a);

        if (!valid) {
            // Hier senden wir jetzt ein strukturiertes JSON-Objekt zurück
            return Response.status(Response.Status.BAD_REQUEST)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "You tried to make an invalid move!"))
                    .build();
        }

        return Response.ok().build();
    }
}