package skyjo.api;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnError;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.inject.Inject;

@WebSocket(path = "/ws/game/{gameId}")
public class GameWebSocket {

    @Inject
    WebSocketConnection connection;

    @OnOpen
    public String onOpen() {
        String gameId = connection.pathParam("gameId");
        System.out.println("WebSocket connected for game " + gameId);

        // Erste Begrüßungs-/Sync-Nachricht an genau diesen Client
        return """
               {
                 "type":"CONNECTED",
                 "gameId":"%s"
               }
               """.formatted(gameId);
    }

    @OnTextMessage
    public String onMessage(String message) {
        String gameId = connection.pathParam("gameId");

        System.out.println("Received message for game " + gameId + ": " + message);

        // Hier würdest du später deine Game-Logik anstoßen
        return """
               {
                 "type":"ACK",
                 "gameId":"%s",
                 "payload":%s
               }
               """.formatted(gameId, quoteJson(message));
    }

    @OnClose
    public void onClose() {
        System.out.println("WebSocket disconnected");
    }

    @OnError
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }

    private String quoteJson(String value) {
        return "\"" + value.replace("\"", "\\\"") + "\"";
    }
}