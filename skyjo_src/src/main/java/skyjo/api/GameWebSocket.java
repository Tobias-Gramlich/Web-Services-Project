package skyjo.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnError;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import skyjo.api.wsconnector.GameConnectionRegistry;
import skyjo.domain.Game;
import skyjo.infrastructure.persistence.repository.GameJooqRepository;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static java.lang.Long.parseLong;

@WebSocket(path = "/ws/game/{gameId}")
@ApplicationScoped
public class GameWebSocket {
    @Inject
    GameConnectionRegistry connectionRegistry;
    @Inject
    ObjectMapper objectMapper;
    @Inject
    GameJooqRepository repo;

    @OnOpen
    public String onOpen(WebSocketConnection connection) {
        // Get GameID
        String gameId = connection.pathParam("gameId");

        // Add Game to Registry
        connectionRegistry.add(parseLong(gameId), connection);

        // Welcome Message
        return """
               {
                 "type": "Message",
                 "gameId": "%s",
                 "message": "Welcome to Skyjo"
               }
               """.formatted(gameId);
    }

    @OnTextMessage
    public String onMessage(WebSocketConnection connection, String message) {
        // Get GameID
        String gameId = connection.pathParam("gameId");

        // Initialize Variables
        String accessToken;
        String messageText;
        long playerId;
        String playerName;

        // Read Message
        try {
            // Convert Message to JSON
            JsonNode jsonMessage = objectMapper.readTree(message);

            // Get AccessToken and Text
            accessToken = jsonMessage.get("accessToken").asText();
            messageText = jsonMessage.get("message").asText();
        }
        catch (Exception e){
            // Send back Error
            return """
            {
             "type": "Error",
             "message": "Invalid JSON Message"
            }
            """;
        }

        // Authenticate User
        try{
            HttpClient client = HttpClient.newHttpClient();

            // Format API Message
            String apiCall = """
                    {
                        "accessToken": "%s"
                    }
                    """.formatted(accessToken);

            // Build API Call
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("http://benutzerverwaltung:3001/Users/auth"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(apiCall))
                    .build();

            // Send API Call
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            // Map Response to JSON
            JsonNode jsonResponse = objectMapper.readTree(httpResponse.body());

            // Get playerID and Username
            playerId = (long) jsonResponse.get("userId").asInt();
            playerName = jsonResponse.get("username").asText();
        }
        catch (Exception e){
            // Send back Error
            return """
            {
             "type": "Error",
             "message": "User Authentication failed"
            }
            """;
        }

        // Get Game from Repo
        Game game = repo.getGameById(Long.valueOf(gameId));

        // Check if Player is in Game
        long finalPlayerId = playerId;
        boolean isPlayerInGame = game.getPlayers().stream()
                .anyMatch(player -> player.getId() == finalPlayerId);

        if (isPlayerInGame){
            // Broadcast Message
            connectionRegistry.broadcastToGame(parseLong(gameId), """
            {
             "type": "Message",
             "username": "%s",
             "message": "%s"
            }
            """.formatted(playerName, messageText));

            return"""
            {
             "type": "Success"
            }
            """;
        }
        else{
            // Send back Error
            return """
            {
             "type": "Error",
             "message": "Player not in Game"
            }
            """;
        }
    }

    @OnClose
    public void onClose(WebSocketConnection connection) {
        String gameId = connection.pathParam("gameId");

        connectionRegistry.remove(parseLong(gameId), connection);
    }

    @OnError
    public void onError(Throwable t) {
        System.out.println("WS ERROR:");
        t.printStackTrace();
    }
}