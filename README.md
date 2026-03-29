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

## Benutzung
Schritt 1: Registrierung und Login

- Öffnen Sie die Hauptanwendung. 
- Neue Nutzer müssen sich zunächst über die Registrierungsseite ein Konto erstellen.
- Loggen Sie sich anschließend mit Ihrer E-Mail und Ihrem Passwort ein.

Schritt 2: Spiel erstellen oder beitreten

- Auf der Startseite sehen Sie alle offenen Spiellobbyss mit Spieleranzahl und Status.
- Erstellen Sie über den entsprechenden Button ein neues Spiel oder treten Sie einer bestehenden Lobby bei.

Schritt 3: Spiel starten und spielen

- Sobald alle Spieler beigetreten sind, startet der Gastgeber die Runde.
- Spielen Sie das Spiel, indem sSie Spielzüge ausführen, wenn Sie an der Reihe sind.

Schritt 4: Spielzüge machen
- Wählen Sie aus ob Sie vom Ziehstapel oder vom Ablegestapel ziehen wollen. 
- Tauschen Sie eine Karte aus ihrem Spielfeld aus, wenn Sie vom Ablegestapel gezogen haben. 
- Tauschen Sie eine Karte aus ihrem Spielfeld aus oder decken sie eine verdeckte Karte auf, wenn Sie eine Karte vom Ziehstapel gezogen haben. 

Eine Anleitung für das Spiel skyjo finden Sie außerdem in diesem [YouTube-Video](https://youtu.be/lKTwTL0xXa4?si=-U2Lr8fBTHOVcQVG).