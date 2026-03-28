import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import { userApi } from '../lib/api';
import {
  isMatchmakingConnected,
  sendMatchmakingMessage,
  subscribeMatchmaking,
} from '../lib/matchmakingSocket';

export function PrivateRoomPage({ authToken }) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(isMatchmakingConnected());
  const [roomCode, setRoomCode] = useState(localStorage.getItem('matchmakingRoomCode') || '');
  const [userId, setUserId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function loadCurrentUser() {
    try {
      const authData = await userApi.auth({ accessToken: authToken });
      setUserId(authData?.userId ?? null);
    } catch (err) {
      setError(err.message || 'Benutzerdaten konnten nicht geladen werden');
    }
  }

  function handleStartRoom() {
    if (!isConnected || !roomCode || !userId) {
      if (!userId) {
        setError('Spiel kann nicht gestartet werden: userId fehlt.');
      }
      return;
    }

    setError('');
    setResult({
      action: 'private.start',
      payload: {
        roomCode,
        userId,
      },
    });

    sendMatchmakingMessage('private.start', {
      roomCode,
      userId,
    });
  }

  function handleLeaveRoom() {
    if (roomCode && isConnected) {
      sendMatchmakingMessage('private.leave', { roomCode, userId });
    }

    localStorage.removeItem('matchmakingRoomCode');
    navigate('/matchmaking');
  }

  useEffect(() => {
    loadCurrentUser();
  }, [authToken]);

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
          const code = String(receivedRoomCode);
          setRoomCode(code);
          localStorage.setItem('matchmakingRoomCode', code);
        }

        if (parsed?.type === 'private.started' && parsed?.payload?.id) {
          navigate(`/skyjo/${parsed.payload.id}`);
          return;
        }

        if (parsed?.type === 'error') {
          setError(parsed?.error || 'Unbekannter Matchmaking-Fehler');
          setResult(parsed);
          return;
        }

        setResult(parsed);
      }
    });

    if (!roomCode) {
      navigate('/matchmaking', { replace: true });
    }

    return unsubscribe;
  }, [navigate, roomCode]);

  return (
    <div className="private-room-page">
      <SectionCard title="Private Room erstellt" subtitle="Hier kannst du den Raum starten oder wieder verlassen.">
        <div className="private-room-content">
          <ResultBox title="Room Code" value={roomCode || 'Kein Room Code vorhanden'} />

          <div className="home-actions">
            <button onClick={handleStartRoom} disabled={!isConnected || !roomCode || !userId}>
              Private Room starten
            </button>
            <button className="secondary-button" onClick={handleLeaveRoom} disabled={!roomCode}>
              Private Room verlassen
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Letzte Antwort">
        <ResultBox value={result} error={error} />
      </SectionCard>
    </div>
  );
}