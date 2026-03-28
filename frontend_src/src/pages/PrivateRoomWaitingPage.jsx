import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import {
  isMatchmakingConnected,
  sendMatchmakingMessage,
  subscribeMatchmaking,
} from '../lib/matchmakingSocket';

export function PrivateRoomWaitingPage() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(isMatchmakingConnected());
  const [roomCode, setRoomCode] = useState(localStorage.getItem('matchmakingRoomCode') || '');

  function handleLeaveRoom() {
    if (roomCode && isConnected) {
      sendMatchmakingMessage('private.leave', { roomCode });
    }

    localStorage.removeItem('matchmakingRoomCode');
    navigate('/matchmaking');
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
          const code = String(receivedRoomCode);
          setRoomCode(code);
          localStorage.setItem('matchmakingRoomCode', code);
        }

        if (parsed?.type === 'private.started' && parsed?.payload?.id) {
          navigate(`/skyjo/${parsed.payload.id}`);
        }
      }
    });

    if (!roomCode) {
      navigate('/matchmaking', { replace: true });
    }

    return unsubscribe;
  }, [navigate, roomCode]);

  return (
    <div className="private-room-page">
      <SectionCard title="Private Room beigetreten" subtitle="Bitte warten bis Spiel beginnt.">
        <div className="private-room-content">
          <ResultBox title="Room Code" value={roomCode || 'Kein Room Code vorhanden'} />

          <div className="waiting-message">
            <h2>Bitte warten bis Spiel beginnt</h2>
            <p className="muted">
              Sobald der Host den privaten Raum startet, wirst du automatisch in das Spiel weitergeleitet.
            </p>
          </div>

          <div className="home-actions">
            <button className="secondary-button" onClick={handleLeaveRoom} disabled={!roomCode}>
              Raum verlassen
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}