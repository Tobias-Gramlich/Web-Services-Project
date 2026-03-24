package skyjo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import skyjo.api.dto.ActionRequest;
import skyjo.api.dto.MoveValidatorResponse;
import skyjo.api.wsconnector.GameConnectionRegistry;
import skyjo.application.Calculator;
import skyjo.application.MoveValidator;
import skyjo.application.Mover;
import skyjo.domain.*;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static skyjo.application.Calculator.calculatePointsFromRound;

@Path("/move")
@Consumes(MediaType.APPLICATION_JSON)
public class Move {
    @Inject
    GameJooqRepository repository;
    @Inject
    GameConnectionRegistry connectionRegistry;
    @Inject
    Mover mover;

    private static final Logger LOG = Logger.getLogger(Move.class);

    @POST
    public Response validateMove(ActionRequest request) throws JsonProcessingException {
        LOG.info("Validating move request");

        Long playerId;

        // 1. Validate User
        ObjectMapper mapper;
        try {
            HttpClient client = HttpClient.newHttpClient();

            // Format API Message
            String message = """
                    {
                        "accessToken": "%s"
                    }
                    """.formatted(request.getPlayerToken());

            // Build API Call
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("http://benutzerverwaltung:3001/Users/auth"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(message))
                    .build();

            // Send API Call
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            // Map Response to JSON
            mapper = new ObjectMapper();
            JsonNode jsonResponse = mapper.readTree(httpResponse.body());

            // Check if API Call was successful
            boolean success = jsonResponse.get("success").asBoolean();
            if (!success) {
                return Response.status(Response.Status.NOT_FOUND)
                        .type(MediaType.APPLICATION_JSON)
                        .entity(jsonResponse.asText())
                        .build();
            }

            // Get playerID
            playerId = (long) jsonResponse.get("userId").asInt();
        } catch (Exception e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Authentication failed"))
                    .build();
        }

        // 2. Load Game from Repository
        Game game = repository.getGameById(request.getGameId());
        if (game == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Game with ID " + request.getGameId() + " not found"))
                    .build();
        }

        // 3. Load Player from Repository
        Player player = repository.getPlayer(playerId);
        if (player == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Player with ID " + playerId + " not found"))
                    .build();
        }

        // 4. Action erstellen und validieren
        Action action = game.createAction(request, player);
        MoveValidatorResponse moveValidatorResponse = MoveValidator.validateMove(action);

        if (!moveValidatorResponse.valid()) {
            // Hier senden wir jetzt ein strukturiertes JSON-Objekt zurück
            return Response.status(Response.Status.BAD_REQUEST)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", moveValidatorResponse.errorMessage()))
                    .build();
        }

        System.out.println("Checkpoint");

        // 6. Move ausführen
        mover.makeMove(action);

        // 7. Broadcast Action to Room
        String payload = mapper.writeValueAsString(Map.of(
                "type", "MOVE_MADE",
                "action", request,
                "playerId", playerId
        ));
        connectionRegistry.broadcastToGame(request.getGameId(), payload);

        //TODO UI - Update an WebSocket senden
        // Spiel beendet
        if (action.getGame().getPhase() == Status.END) {
            // Punktzahlen berechnen
            Map<Long, Long> points= Calculator.calculatePointsFromRound(game);

            // Punktzahlen zu bestehenden Punkten aus vorherigen Runden addieren
            game.addPoints(points);

            //überprüfen, ob Spiel zu Ende ist: Wenn ein Spieler mehr als 100 Punkte aus den Runden gesammelt hat
            if(game.checkIfEnd()) {
                // get end points to return to UI
                Map<Long, Long> endPoints = Calculator.calculateEndPoints(game);
                //TODO  return end points through web socket
            }
            // TODO  update end round

        }
        //TODO Spiel nicht beendet - neuer GameSnapshot als Update senden.


        return Response.ok().build();
    }
}