# Web-Socket-Nachrichten skyjo-logic
- Web-Socket-Connection: ws://localhost:8090/ws/game/{id}
- 
Es handelt sich um eine Dokumentation, die lediglich die funktionierenden Calls auflistet ohne Fehlermeldungen

- Authentification

Payload:
```
{
    "accessToken": String,
    "message": String
}
```

Antwort: 

```
{
    "type": string
}
```


## UI-Updates
UI-Updates sind Nachrichten, die nur vom Server gesendet werden und haben typischerweise diese Struktur
```
{
    "type": string,
    "payload": string
```

Es gibt 3 Arten von Payloads, die durch Type definiert werden - `UI_UPDATE`, `END_ROUND` und `END_GAME`.

- `UI_UPDATE` wird für Updates innerhalb einer Spielrunde genutzt.
```
{
  "id": number,
  "players": [ Player ],
  "discardCard": Card,
  "currentPlayerIndex": number,
  "currentPlayerId": number,
  "phase": string,
  "round": number
}
```

mit Player
```
{
  "id": number,
  "playField": PlayField,
  "points": number,
  "lastMoveDone": boolean
}
```

mit PlayField:
```
{
  "cards": [ Card ]
}
```

mit Card:
```
{
  "revealed": boolean,
  "value": number | null
}
```

- Der Payload von `END_ROUND` und `END_GAME` sieht identisch aus. 
  - `END_ROUND` wird benutzt, um die Zwischenstände zwischen Runden auszugeben.
  - `END_GAME` wird benutzt, um die endgültigen Spielergebnisse anzuzeigen. 
Payload:
```
{
  "type": "END_ROUND" | "END_GAME",
  "payload": {
    "<playerId>": number
  }
}
```
