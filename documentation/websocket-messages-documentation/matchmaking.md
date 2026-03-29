# Web-Socket-Nachrichten Matchmaking
- Web-Socket-Connection: ws://localhost:8080

- Authentication:
  Request:
```
{
    "type": "user.authenticate",
    "payload": {
        "accessToken": String
    }
}
```

Answer:
```
"Logged in as: username"
```

- Create Room:
  Request:
```
{
    "type": "private.create",
    "payload": {}
}
```

Answer:
```
{
    "type": "private.created",
    "payload": {
        "roomCode": String,
        "room": {
            "roomCode": String,
            "hostId": Int,
            "state": String,
            "players": [
                {
                    "userId": Int,
                    "isHost": Boolean
                }
            ],
            "maxPlayers": Int
        }
    }
}
```

- Join Room:
  Request:
```
{
    "type": "private.join",
    "payload": {
        "roomCode": String
    }
}
```

Answer:
```
{
    "type": "private.joined",
    "payload": {
        "roomCode": String,
        "room": {
            "roomCode": String,
            "hostId": Int,
            "state": String,
            "players": [
                {
                    "userId": Int,
                    "isHost": Boolean
                },
                {
                    "userId": Int,
                    "isHost": Boolean
                }
            ],
            "maxPlayers": Int
        }
    }
}
```

- Leave Room:
  Request:
```
{
    "type": "private.leave",
    "payload": {
        "roomCode": String
    }
}
```

Answer:
```
{
    "type": "private.left",
    "payload": {
        "roomCode": String,
        "closed": Boolean
    }
}
```

- Start Room:
  Request:
```
{
    "type": "private.start",
    "payload": {
        "roomCode": String
    }
}
```

Answer:
```
{
    "type": "private.started",
    "payload": {
        "roomCode": String,
        "room": {
            "roomCode": String,
            "hostId": Int,
            "state": String,
            "players": [
                {
                    "userId": Int,
                    "isHost": Boolean
                },
                {
                    "userId": Int,
                    "isHost": Boolean
                }
            ],
            "maxPlayers": Int
        }
    }
}
```