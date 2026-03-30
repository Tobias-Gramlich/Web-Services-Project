package skyjo.api.wsconnector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class GameConnectionRegistry {
    private final Map<Long, Set<WebSocketConnection>> connections = new ConcurrentHashMap<>();
    private static final Logger LOG = Logger.getLogger(GameConnectionRegistry.class);
    // Add Connection to Registry
    public void add(Long gameId, WebSocketConnection connection){
        connections.computeIfAbsent(gameId, k -> ConcurrentHashMap.newKeySet()).add(connection);
    }

    // Remove Connection from Registry
    public void remove(Long gameId, WebSocketConnection connection) {
        Set<WebSocketConnection> set = connections.get(gameId);
        if (set != null) {
            set.remove(connection);
            if (set.isEmpty()) {
                connections.remove(gameId);
            }
        }
    }

    // Broadcast to Game
    public void broadcastToGame(Long gameId, String message) {
        Set<WebSocketConnection> set = connections.get(gameId);
        if (set == null) {
            return;
        }

        set.removeIf(connection -> !connection.isOpen());

        for (WebSocketConnection connection : set) {
            try {
                connection.sendTextAndAwait(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (set.isEmpty()) {
            connections.remove(gameId);
        }
    }

    public static Response authenticate(String token) {
        ObjectMapper mapper;
        try {
            HttpClient client = HttpClient.newHttpClient();

            // Format API Message
            String message = """
                    {
                        "accessToken": "%s"
                    }
                    """.formatted(token);
            LOG.info("Authenticating with token: " + message);
            // Build API Call
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(System.getenv("USER_MANAGEMENT_ROUTE")))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(message))
                    .build();

            // Send API Call
            HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            LOG.info("Answer from API: " + httpResponse.body());
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
            // Return the full body on success
            return Response.ok()
                    .type(MediaType.APPLICATION_JSON)
                    .entity(httpResponse.body())  // raw string body
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.NOT_FOUND)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(Map.of("error", "Authentication failed"))
                    .build();

        }

    }
}
