const { Rooms } = require("../models");
const axios = require('axios');
const {
  getStore,
  safeSend,
  broadcastToRoom,
} = require("./privateRoomStore");

const MIN_PLAYERS_TO_START = 2;

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
    response = await axios.post(process.env.SKYJO_LOGIC_ROUTE, arrayOfPlayers);
    if (response.data.error) {
      safeSend(ws, {
        type: "error",
        error: "SKYJO_SETUP_FAILED",
        payload: { roomCode },
      });
      return;
    }
  } catch (err) {
    safeSend(ws, {
      type: "error",
      error: "SKYJO_SETUP_FAILED",
      payload: { roomCode },
    });
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