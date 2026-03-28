package skyjo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import skyjo.api.dto.AuthTokenRequest;
import skyjo.api.dto.PlayfieldCardRequest;
import skyjo.api.wsconnector.GameConnectionRegistry;
import skyjo.domain.Action;
import skyjo.domain.Card;
import skyjo.domain.Game;
import skyjo.infrastructure.persistence.dto.ActionRow;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.util.Map;

@Path("/getCard/{id}")
public class CardFromDrawPile {
    @Inject
    GameJooqRepository repo;
    ObjectMapper mapper = new ObjectMapper();
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCard(@PathParam("id") Long id, AuthTokenRequest request) throws JsonProcessingException {
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

        if (playerId != game.getCurrentPlayer().getId()){
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "It's not your turn"))
                    .build();
        }

        Card card = game.getDrawPile().showFirstCard();
        repo.updateGameSnapshot(game);
        return Response.status(Response.Status.OK).type(MediaType.APPLICATION_JSON).entity(card).build();
    }

    @GET
    @Path("/pf")
    public Response revealCardInPlayField(@PathParam("id") Long id, PlayfieldCardRequest request) throws JsonProcessingException {
        long playerId = 0L;
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

        if (playerId != game.getCurrentPlayer().getId()){
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "It's not your turn"))
                    .build();
        }
        //check if player already revealed a card in current action
        ActionRow a = repo.getActionRow((long) game.getMoveCounter(), game.getId());
        if (a == null) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Move not initialised"))
                    .build();
        }

        if (a.revealed_card())  {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "You can only reveal one card in your playfield per move"))
                    .build();
        }



        Card card = game.getCurrentPlayer().getPlayField().getCard(request.getCardIndex()/4, request.getCardIndex()%4);

        if(card.isRevealed()) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "This card is already revealed"))
                    .build();
        } else {
            card.reveal();
        }

        repo.revealCard(game);

        repo.updateGameSnapshot(game);
        return Response.status(Response.Status.OK)
                .type(MediaType.APPLICATION_JSON)
                .entity(card)
                .build();
    }

}