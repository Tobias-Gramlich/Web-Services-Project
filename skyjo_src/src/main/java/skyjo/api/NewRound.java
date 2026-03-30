package skyjo.api;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.OPTIONS;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import skyjo.api.dto.RoundCoordinationRequest;
import skyjo.api.mapper.GameResponseMapper;
import skyjo.api.wsconnector.GameConnectionRegistry;
import skyjo.application.Calculator;
import skyjo.application.GameUpsetter;
import skyjo.domain.Game;
import skyjo.domain.Status;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.HashMap;
import java.util.Map;

@Path("/round")
public class NewRound {
    @Inject
    GameConnectionRegistry gameConnectionRegistry;
    @Inject
    GameJooqRepository repository;
    @Inject
    GameUpsetter gameUpsetter;
    @OPTIONS
    public Response options() {
        return Response.ok().build();
    }
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response newRound(RoundCoordinationRequest request) {
        Long playerId;
        ObjectMapper mapper = new ObjectMapper();
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

        // 2. Load Game from Repository
        Game game = repository.getGameById(request.getGameId());
        if (game == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Game with ID " + request.getGameId() + " not found"))
                    .build();
        }

        // check if player is admin
        if (game.getAdminId() != playerId) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Only admin players can start a new round"))
                    .build();
        }

        // check if game actually ended last round properly and make custom answer messages
        boolean mistake = false;
        String messages = switch (game.getPhase()) {
            case Status.ROUNDS -> {
                mistake = true;
                yield "There's already an ongoing round!";
            }
            case Status.END_GAME -> {
                mistake = true;
                yield "Game ended, there won't be a next round, but there may be a next game :)";
            }
            case Status.SETUP -> {
                mistake = true;
                yield "Game is in setup phase, please wait!";
            }
            default -> "";
        };
        if (mistake) {
            return Response.status(Response.Status.CONFLICT).entity(Map.of("message", messages)).build();
        }

        // setup new round when wanted
        if (request.isNextRound()) {
            try {
                gameUpsetter.roundSetUp(game);
            } catch (JsonProcessingException e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(Map.of("error", e.getMessage())).build();
            }

            // initialise payload for websocket
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "UI_UPDATE");
            payload.put("payload", GameResponseMapper.toResponse(game));

            gameConnectionRegistry.broadcastToGame(game.getId(), payload.toString());

            return Response.status(Response.Status.CREATED).entity(Map.of("message", "New round started. UI Updates via websocket.")).build();
        } else {
            Calculator.calculateEndPoints(game);
            game.setPhase(Status.END_GAME, repository);
            // get end points to return to UI
            Map<Long, Long> endPoints = Calculator.calculateEndPoints(game);
            Map<String, Object> message1 = new HashMap<>();
            message1.put("type", "END_POINTS");
            message1.put("payload", endPoints);
            gameConnectionRegistry.broadcastToGame(request.getGameId(), message1.toString());
            return Response.status(Response.Status.CREATED).entity(Map.of("message", "Game ended. End points via websocket.")).build();

        }
    }
}
