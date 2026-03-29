# Web-Services-Project
## How to build locally:
0. docker compose down
1. docker compose up -d web-services-db
2. cd skyjo_src
3. ./gradlew build
4. cd ..
5. docker compose up --build

## Dokumentation - Hinweise
- Die Folien der Präsentation sind [hier](./documentation/presentation-slides.pdf) zu finden. 
- Die Dokumentation kann unter diesem [Link](./documentation/documentation.pdf) abgerufen werden. 
- Open-API-Dokumentationen der  implementierten REST-APIs sind in diesem [Unterverzeichnis](./documentation/open-api-documentation) abgelegt. 
- Eine übersichtliche Darstellung der WebSocket-Nachrichten befindet sich [hier](./documentation/websocket-messages-documentation)
