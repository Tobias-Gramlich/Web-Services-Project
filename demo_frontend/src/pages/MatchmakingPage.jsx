import { useEffect, useMemo, useRef, useState } from 'react';
import { FormCard } from '../components/FormCard';
import { PageHeader } from '../components/PageHeader';
import { ProtectedNotice } from '../components/ProtectedNotice';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { config } from '../lib/config';

function stringifyMessage(data) {
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function MatchmakingPage() {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [socketState, setSocketState] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [roomSnapshot, setRoomSnapshot] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { values, handleChange } = useFormState({ roomCode: '' });

  const canConnect = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  function appendMessage(kind, payload) {
    setMessages((current) => [
      {
        id: crypto.randomUUID(),
        kind,
        payload: stringifyMessage(payload),
        timestamp: new Date().toLocaleTimeString('de-DE'),
      },
      ...current,
    ]);
  }

  function connectSocket() {
    setError('');
    setInfo('');
    if (!token) {
      setError('Bitte zuerst einloggen, damit das JWT an den Matchmaking-WebSocket gesendet werden kann.');
      return;
    }

    const ws = new WebSocket(config.matchmakingWsUrl);
    socketRef.current = ws;
    setSocketState('connecting');

    ws.onopen = () => {
      setSocketState('connected');
      appendMessage('system', 'WebSocket verbunden. Authentifizierung wird gesendet.');
      ws.send(
        JSON.stringify({
          type: 'user.authenticate',
          payload: { accessToken: token },
        })
      );
    };

    ws.onmessage = (event) => {
      appendMessage('incoming', event.data);
      try {
        const parsed = JSON.parse(event.data);
        if (parsed?.payload?.roomCode) {
          setRoomCode(parsed.payload.roomCode);
        }
        if (parsed?.payload?.room) {
          setRoomSnapshot(parsed.payload.room);
        }
      } catch {
        if (typeof event.data === 'string' && event.data.includes('Logged in as')) {
          setInfo(event.data);
        }
      }
    };

    ws.onerror = () => {
      setError('WebSocket-Fehler beim Verbinden oder Senden.');
    };

    ws.onclose = () => {
      setSocketState('disconnected');
      appendMessage('system', 'WebSocket getrennt.');
    };
  }

  function disconnectSocket() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }

  function sendMessage(type, payload = {}) {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Kein aktiver WebSocket verbunden.');
      return;
    }
    const message = { type, payload };
    appendMessage('outgoing', message);
    socket.send(JSON.stringify(message));
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Matchmaking"
        description="WebSocket-Steuerung für private/public Room-Flows. Das JWT wird direkt nach dem Connect mit `user.authenticate` gesendet."
      />
      <ProtectedNotice />
      <StatusMessage error={error} info={info} />

      <div className="double-grid">
        <FormCard
          title="WebSocket Verbindung"
          description={`WS URL: ${config.matchmakingWsUrl}`}
          footer={<p className="muted">Angemeldeter Benutzer: {user?.username ?? '—'}</p>}
        >
          <div className="button-row">
            <button className="primary-button" type="button" onClick={connectSocket} disabled={!canConnect || socketState === 'connected' || socketState === 'connecting'}>
              {socketState === 'connecting' ? 'Verbinde...' : 'WebSocket verbinden'}
            </button>
            <button className="secondary-button" type="button" onClick={disconnectSocket} disabled={socketState !== 'connected'}>
              Trennen
            </button>
          </div>
          <div className="mini-stats">
            <div><span className="label">Status</span><strong>{socketState}</strong></div>
            <div><span className="label">Aktueller Raum</span><strong>{roomCode || '—'}</strong></div>
          </div>
        </FormCard>

        <FormCard title="Private Rooms" description="Unterstützt create, join, start und leave auf Basis deiner aktuellen Backend-Events.">
          <div className="form-grid compact-grid">
            <label>
              Room Code
              <input name="roomCode" value={values.roomCode} onChange={handleChange} placeholder="z. B. 1" />
            </label>
            <div className="button-row wrap">
              <button className="primary-button" type="button" onClick={() => sendMessage('private.create')}>
                Private Create
              </button>
              <button className="secondary-button" type="button" onClick={() => sendMessage('private.join', { roomCode: values.roomCode })}>
                Private Join
              </button>
              <button className="secondary-button" type="button" onClick={() => sendMessage('private.start', { roomCode: values.roomCode || roomCode })}>
                Private Start
              </button>
              <button className="secondary-button" type="button" onClick={() => sendMessage('private.leave', { roomCode: values.roomCode || roomCode })}>
                Private Leave
              </button>
            </div>
          </div>
        </FormCard>
      </div>


      <FormCard title="Nachrichtenprotokoll" description="Neueste Nachricht oben.">
        <div className="message-log">
          {messages.length === 0 ? <p className="muted">Noch keine WebSocket-Nachrichten.</p> : null}
          {messages.map((message) => (
            <article key={message.id} className={`message-entry ${message.kind}`}>
              <div className="message-head">
                <strong>{message.kind}</strong>
                <span>{message.timestamp}</span>
              </div>
              <pre>{message.payload}</pre>
            </article>
          ))}
        </div>
      </FormCard>
    </div>
  );
}
