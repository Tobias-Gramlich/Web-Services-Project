const { Rooms } = require("../models");
const axios = require('axios');
const {
  getStore,
  safeSend,
  broadcastToRoom,
} = require("./privateRoomStore");

const MIN_PLAYERS_TO_START = 1;

function normalizeRoomCode(input) {
  return (input ?? "").toString().trim();
}

function countPlayers(dbRoom) {
  let c = 0;
  if (dbRoom.host != null) c++;
  if (dbRoom.player2 != null) c++;
  if (dbRoom.player3 != null) c++;
  if (dbRoom.player4 != null) c++;
  return c;
}

async function PrivateStart(ws, payload = {}) {
  const store = getStore();
  const userId = payload.userId;
  const roomCodeFromPayload = normalizeRoomCode(payload.roomCode);
  const roomCode = roomCodeFromPayload || store.codeBySocket.get(ws);

  if (userId === undefined || userId === null || userId === "") {
    safeSend(ws, { type: "error", error: "MISSING_USER_ID" });
    return;
  }

  if (!roomCode) {
    safeSend(ws, { type: "error", error: "MISSING_ROOM_CODE" });
    return;
  }

  const dbRoom = await Rooms.findByPk(roomCode);
  if (!dbRoom) {
    safeSend(ws, { type: "error", error: "ROOM_NOT_FOUND", payload: { roomCode } });
    return;
  }

  if (String(dbRoom.host) !== String(userId)) {
    safeSend(ws, { type: "error", error: "ONLY_HOST_CAN_START", payload: { roomCode } });
    return;
  }

  if (dbRoom.state !== "lobby") {
    safeSend(ws, { type: "error", error: "ROOM_ALREADY_STARTED", payload: { roomCode } });
    return;
  }

  const playerCount = countPlayers(dbRoom);
  if (playerCount < MIN_PLAYERS_TO_START) {
    safeSend(ws, {
      type: "error",
      error: "NOT_ENOUGH_PLAYERS",
      payload: {
        roomCode,
        minPlayers: MIN_PLAYERS_TO_START,
        currentPlayers: playerCount,
      },
    });
    return;
  }

  const arrayOfPlayers = [
    dbRoom.host,
    dbRoom.player2,
    dbRoom.player3,
    dbRoom.player4,
  ].filter((player) => player != null);

  let response;

  try {
    console.log("Sende POST an:", process.env.SKYJO_LOGIC_ROUTE);
    console.log("Daten:", JSON.stringify(arrayOfPlayers));

    response = await axios.post(process.env.SKYJO_LOGIC_ROUTE, arrayOfPlayers, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log("Quarkus Response Status:", response.status);
  } catch (err) {
    console.error("AXIOS FEHLER DETAILS:");
    if (err.response) {
      // Der Server hat mit einem Fehler-Code geantwortet (z.B. 415, 400, 500)
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      // Es gab ein Netzwerkproblem oder die URL ist falsch
      console.error("Fehler Nachricht:", err.message);
    }

    safeSend(ws, { type: "error", error: "SKYJO_SETUP_FAILED" });
    return;
  }

  dbRoom.state = "started";
  await dbRoom.save();

  broadcastToRoom(store, roomCode, {
    type: "private.started",
    payload: response.data,
  });
}

module.exports = { PrivateStart };