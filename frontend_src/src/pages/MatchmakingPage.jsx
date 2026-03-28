import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { FormRow } from '../components/FormRow';
import {
  connectMatchmakingSocket,
  disconnectMatchmakingSocket,
  isMatchmakingConnected,
  sendMatchmakingMessage,
  subscribeMatchmaking,
} from '../lib/matchmakingSocket';

export function MatchmakingPage({ authToken }) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(isMatchmakingConnected());
  const [joinRoomCode, setJoinRoomCode] = useState(localStorage.getItem('matchmakingRoomCode') || '');

  function persistRoomCode(code) {
    const value = String(code || '');
    setJoinRoomCode(value);

    if (value) {
      localStorage.setItem('matchmakingRoomCode', value);
    } else {
      localStorage.removeItem('matchmakingRoomCode');
    }
  }

  function connect() {
    connectMatchmakingSocket(authToken);
  }

  function disconnect() {
    disconnectMatchmakingSocket();
  }

  function handleCreatePrivateRoom() {
    if (!isConnected) return;

    const ok = sendMatchmakingMessage('private.create', {});
    if (!ok) return;

    navigate('/matchmaking/private-room');
  }

  function handleJoinPrivateRoom() {
    if (!isConnected || !joinRoomCode.trim()) return;

    const roomCode = joinRoomCode.trim();
    const ok = sendMatchmakingMessage('private.join', { roomCode });
    if (!ok) return;

    persistRoomCode(roomCode);
    navigate('/matchmaking/private-room-waiting');
  }

  useEffect(() => {
    const unsubscribe = subscribeMatchmaking((event) => {
      if (event.type === 'open') {
        setIsConnected(true);
      }

      if (event.type === 'close' || event.type === 'error') {
        setIsConnected(false);
      }

      if (event.type === 'message') {
        const parsed = event.payload;
        const receivedRoomCode =
          parsed?.payload?.roomCode ??
          parsed?.roomCode ??
          parsed?.code;

        if (receivedRoomCode) {
          localStorage.setItem('matchmakingRoomCode', String(receivedRoomCode));
        }
      }
    });

    setIsConnected(isMatchmakingConnected());

    return unsubscribe;
  }, []);

  return (
    <div className="matchmaking-layout">
      <aside className="matchmaking-sidebar card">
        <div>
          <div className="eyebrow">Matchmaking</div>
          <h2 className="sidebar-title">Aktionen</h2>
          <p className="muted">
            Verbinde zuerst den WebSocket und wähle dann einen privaten Raum aus.
          </p>
        </div>

        <div className="matchmaking-sidebar-actions">
          <button onClick={handleCreatePrivateRoom} disabled={!isConnected}>
            Private Room erstellen
          </button>

          <div className="sidebar-join-box">
            <input
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value)}
              placeholder="Room Code"
              disabled={!isConnected}
            />
            <button
              className="secondary-button"
              onClick={handleJoinPrivateRoom}
              disabled={!isConnected || !joinRoomCode.trim()}
            >
              Private Room beitreten
            </button>
          </div>
        </div>
      </aside>

      <div className="matchmaking-content">
        <SectionCard title="WebSocket Verbindung" subtitle="Verbindung zum Matchmaking-Service">
          <FormRow>
            <button onClick={connect} disabled={isConnected}>
              Verbinden
            </button>
            <button className="secondary-button" onClick={disconnect} disabled={!isConnected}>
              Trennen
            </button>
          </FormRow>
          <div className="status-pill">{isConnected ? 'Verbunden' : 'Nicht verbunden'}</div>
        </SectionCard>
      </div>
    </div>
  );
}