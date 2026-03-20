package skyjo.api.wsconnector;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class GameConnectionRegistry {
    private final Map<Long, Set<WebSocketConnection>> connections = new ConcurrentHashMap<>();

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
}
