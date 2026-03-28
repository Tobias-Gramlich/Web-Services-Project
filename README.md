# Web-Services-Project
## How to Start:
0. docker compose down
1. docker compose up -d web-services-db
2. cd skyjo_src
3. ./gradlew build
4. cd ..
5. docker compose up --build

## Endpoints:
### Color Scheme:
- GET http://localhost:3003/scheme
Answer:
```
{
    "request": {
        "time_of_day": String, 
        "day_type": String, 
        "weather": String
    }, 
    "scheme": {
        "background": String, 
        "surface": String, 
        "primary_color": String, 
        "secondary_color": String
    }
}
```

- POST http://localhost:3003/scheme
Payload:
```
{
    "time_of_day": "Morning",
    "day_type": "Weekday",
    "weather": "Sunny"
}
```

Answer:
```
{
    "background": String,
    "surface": String,
    "primary_color": String,
    "secondary_color": String
}
```

### Benutzerverwaltung:
- POST http://localhost:3001/Users/register
Payload:
```
{
    "username": String,
    "password": String,
    "email": String
}
```

Answer:
```
{
    "success": true
}
```

- POST http://localhost:3001/Users/send_email
Payload:
```
{
    "username": String,
    "password": String
}
```

Answer:
```
{
    "success": true
}
```

- POST http://localhost:3001/Users/activate
Payload:
```
{
    "username": String,
    "activationcode": Int
}
```

Answer:
```
{
    "success": true
}
```

- POST http://localhost:3001/Users/login
Payload:
```
{
    "username": String,
    "password": String
}
```

Answer:
```
{
    "success": true,
    "accessToken": String
}
```

- POST http://localhost:3001/Users/auth
Payload:
```
{
    "accessToken": String
}
```

Answer:
```
{
    "success": true,
    "username": String,
    "userId": Int,
    "email": String
}
```

- PUT http://localhost:3001/Users/change_Username
Payload:
```
{
    "accessToken": String,
    "newName": String
}
```

Answer:
```
{
    "success": true
}
```

- PUT http://localhost:3001/Users/change_Password
Payload:
```
{
    "accessToken": String,
    "newPassword": String
}
```

Answer:
```
{
    "success": true
}
```

- DELETE http://localhost:3001/Users/delete_Account
Payload:
```
{
    "accessToken": String
}
```

Answer:
```
{
    "success": true
}
```

### Matchmaking:
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

### Skyjo-Logic:
- GET http://localhost:8090/test
Answer:
"ok"

- POST http://localhost:8090/setUpGame
Payload:
```
[
  Int, Int
]
```

Answer:
```
{
    "id": Int,
    "players": [
        {
            "id": Int,
            "playField": {
                "cards": [
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    }
                ]
            },
            "points": 0,
            "lastMoveDone": false
        },
        {
            "id": Int,
            "playField": {
                "cards": [
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    }
                ]
            },
            "points": 0,
            "lastMoveDone": false
        }
    ],
    "currentPlayerIndex": 0,
    "currentPlayerId": Int,
    "phase": "SETUP",
    "round": 1
}

- POST http://localhost:8090/move
Payload:
{
    "gameId": Int,
    "playerToken": String,
    "actionType": "DRAW_FROM_DRAW_PILE",
    "cardIndex": Int,
    "fromDrawPile": Boolean,
    "keepCard": Boolean
}
```

Answer: -> Fehlercode oder Okay

- GET http://localhost:8090/getGame-{id}
Answer:
```
{
    "id": Int,
    "players": [
        {
            "id": Int,
            "playField": {
                "cards": [
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    }
                ]
            },
            "points": Int,
            "lastMoveDone": Boolean
        },
        {
            "id": Int,
            "playField": {
                "cards": [
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    },
                    {
                        "revealed": false,
                        "value": null
                    }
                ]
            },
            "points": Int,
            "lastMoveDone": Boolean
        }
    ],
    "currentPlayerIndex": Int,
    "currentPlayerId": Int,
    "phase": String,
    "round": Int
}
```

- Web-Socket-Connection: ws://localhost:8090/ws/game/{id}
Payload:
```
{
    "accessToken": String,
    "message": String
}
```
