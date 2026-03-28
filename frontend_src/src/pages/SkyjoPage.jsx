import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { ResultBox } from '../components/ResultBox';
import { skyjoApi, userApi } from '../lib/api';
import { config } from '../lib/config';

const initialTurnState = {
  stage: 'idle',
  source: null,
  drawnCard: null,
};

export function SkyjoPage({ authToken }) {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);

  const [game, setGame] = useState(null);
  const [me, setMe] = useState(null);
  const [turnState, setTurnState] = useState(initialTurnState);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadGame() {
    if (!gameId) return;
    const data = await skyjoApi.getGame(gameId);
    setGame(data);
    return data;
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setLoading(true);
      setError('');

      try {
        const [authData, gameData] = await Promise.all([
          userApi.auth({ accessToken: authToken }),
          skyjoApi.getGame(gameId),
        ]);

        if (!active) return;

        setMe({
          userId: authData?.userId,
          username: authData?.username,
        });
        setGame(gameData);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Skyjo konnte nicht geladen werden');
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [authToken, gameId]);

  useEffect(() => {
    if (!gameId) return;

    const ws = new WebSocket(`${config.skyjoWsBase}/ws/game/${gameId}`);
    wsRef.current = ws;

    ws.onmessage = async () => {
      try {
        await loadGame();
      } catch {
        // ignore refresh errors from background websocket updates
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [gameId]);

  const currentPlayer = useMemo(() => {
    if (!game?.players?.length) return null;
    return game.players.find((player) => String(player.id) === String(game.currentPlayerId)) || null;
  }, [game]);

  const myPlayer = useMemo(() => {
    if (!game?.players?.length || !me?.userId) return null;
    return game.players.find((player) => String(player.id) === String(me.userId)) || null;
  }, [game, me]);

  const otherPlayers = useMemo(() => {
    if (!game?.players?.length || !me?.userId) return game?.players || [];
    return game.players.filter((player) => String(player.id) !== String(me.userId));
  }, [game, me]);

  const isMyTurn = String(game?.currentPlayerId || '') === String(me?.userId || '');

  async function handleDrawFromDrawPile() {
    if (!isMyTurn || actionLoading) return;

    setActionLoading(true);
    setError('');

    try {
      const drawnCard = await skyjoApi.getCard(gameId, authToken);
      setTurnState({
        stage: 'drawn_from_draw_pile',
        source: 'draw',
        drawnCard,
      });
      await loadGame();
    } catch (err) {
      setError(err.message || 'Karte konnte nicht vom Nachziehstapel gezogen werden');
    } finally {
      setActionLoading(false);
    }
  }

  function handleDrawFromDiscardPile() {
    if (!isMyTurn || actionLoading) return;

    setError('');
    setTurnState({
      stage: 'drawn_from_discard_pile',
      source: 'discard',
      drawnCard: null,
    });
  }

  async function submitMove({ actionType, cardIndex, fromDrawPile, keepCard }) {
    setActionLoading(true);
    setError('');

    try {
      await skyjoApi.move({
        gameId: Number(gameId),
        playerToken: authToken,
        actionType,
        cardIndex,
        fromDrawPile,
        keepCard,
      });

      setTurnState(initialTurnState);
      await loadGame();
    } catch (err) {
      setError(err.message || 'Move konnte nicht gesendet werden');
    } finally {
      setActionLoading(false);
    }
  }

  function handleCardClick(cardIndex, card) {
    if (!isMyTurn || actionLoading || !myPlayer) return;

    if (turnState.stage === 'drawn_from_discard_pile') {
      submitMove({
        actionType: 'DRAW_FROM_DISCARD_PILE',
        cardIndex,
        fromDrawPile: false,
        keepCard: true,
      });
      return;
    }

    if (turnState.stage === 'drawn_from_draw_pile_swap') {
      submitMove({
        actionType: 'DRAW_FROM_DRAW_PILE',
        cardIndex,
        fromDrawPile: true,
        keepCard: true,
      });
      return;
    }

    if (turnState.stage === 'drawn_from_draw_pile_discard') {
      if (card?.revealed) return;

      submitMove({
        actionType: 'DRAW_FROM_DRAW_PILE',
        cardIndex,
        fromDrawPile: true,
        keepCard: false,
      });
    }
  }

  function prepareSwapFromDrawPile() {
    if (turnState.stage !== 'drawn_from_draw_pile') return;
    setTurnState((current) => ({
      ...current,
      stage: 'drawn_from_draw_pile_swap',
    }));
  }

  function prepareDiscardFromDrawPile() {
    if (turnState.stage !== 'drawn_from_draw_pile') return;
    setTurnState((current) => ({
      ...current,
      stage: 'drawn_from_draw_pile_discard',
    }));
  }

  function cancelTurnSelection() {
    if (actionLoading) return;
    setTurnState(initialTurnState);
  }

  const helperText = useMemo(() => {
    if (!game || !me) return 'Spiel wird geladen …';

    if (turnState.stage === 'drawn_from_discard_pile') {
      return 'Wähle eine Karte in deinem Spielfeld, die gegen die oberste Ablagestapel-Karte getauscht werden soll.';
    }

    if (turnState.stage === 'drawn_from_draw_pile') {
      return 'Du hast eine Karte vom Nachziehstapel gezogen. Entscheide jetzt, ob du sie tauschen oder ablegen willst.';
    }

    if (turnState.stage === 'drawn_from_draw_pile_swap') {
      return 'Wähle eine Karte in deinem Spielfeld, die gegen die gezogene Karte getauscht werden soll.';
    }

    if (turnState.stage === 'drawn_from_draw_pile_discard') {
      return 'Lege die gezogene Karte ab und decke eine verdeckte Karte in deinem Spielfeld auf.';
    }

    if (isMyTurn) {
      return 'Du bist am Zug.';
    }

    return `Spieler ${currentPlayer?.id ?? '—'} ist am Zug.`;
  }, [game, me, turnState, isMyTurn, currentPlayer]);

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="card boot-card">
          <div className="spinner" />
          <h1>Skyjo wird geladen …</h1>
          <p className="muted">Das Spielbrett wird vorbereitet.</p>
        </div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="page-grid">
        <SectionCard title="Skyjo konnte nicht geladen werden">
          <ResultBox error={error} />
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-grid skyjo-grid">
      <SectionCard title={`Skyjo – Spiel #${game?.id || gameId}`} subtitle={helperText}>
        <div className="skyjo-status-grid">
          <div className="stat-card">
            <div className="eyebrow">Runde</div>
            <strong>{game?.round ?? '—'}</strong>
          </div>
          <div className="stat-card">
            <div className="eyebrow">Phase</div>
            <strong>{game?.phase ?? '—'}</strong>
          </div>
          <div className="stat-card">
            <div className="eyebrow">Aktueller Spieler</div>
            <strong>{currentPlayer?.id ?? '—'}</strong>
          </div>
          <div className="stat-card">
            <div className="eyebrow">Du</div>
            <strong>{me?.userId ?? '—'}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Aktionsbereich" subtitle="Ziehe Karten und führe deinen Zug aus.">
        <div className="skyjo-action-panel">
          <div className="skyjo-piles">
            <button
              onClick={handleDrawFromDrawPile}
              disabled={!isMyTurn || actionLoading}
            >
              Vom Nachziehstapel ziehen
            </button>

            <button
              className="secondary-button"
              onClick={handleDrawFromDiscardPile}
              disabled={!isMyTurn || actionLoading}
            >
              Vom Ablagestapel nehmen
            </button>
          </div>

          <div className="skyjo-drawn-area">
            <div className="eyebrow">Gezogene Karte</div>
            <div className="skyjo-drawn-card">
              {turnState.drawnCard?.value ?? '—'}
            </div>
          </div>

          {turnState.stage === 'drawn_from_draw_pile' ? (
            <div className="home-actions">
              <button onClick={prepareSwapFromDrawPile} disabled={actionLoading}>
                Gezogene Karte tauschen
              </button>
              <button className="secondary-button" onClick={prepareDiscardFromDrawPile} disabled={actionLoading}>
                Gezogene Karte ablegen
              </button>
            </div>
          ) : null}

          {turnState.stage !== 'idle' ? (
            <button className="secondary-button" onClick={cancelTurnSelection} disabled={actionLoading}>
              Auswahl zurücksetzen
            </button>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Dein Spielfeld" subtitle="3 x 4 Karten – anklickbar, wenn dein aktueller Zug eine Auswahl braucht.">
        <PlayerField
          player={myPlayer}
          selectable={isMyTurn && (
            turnState.stage === 'drawn_from_discard_pile' ||
            turnState.stage === 'drawn_from_draw_pile_swap' ||
            turnState.stage === 'drawn_from_draw_pile_discard'
          )}
          revealOnly={turnState.stage === 'drawn_from_draw_pile_discard'}
          onCardClick={handleCardClick}
        />
      </SectionCard>

      <SectionCard title="Andere Spieler" subtitle="Übersicht der übrigen Spielfelder.">
        <div className="skyjo-other-players">
          {otherPlayers.length === 0 ? (
            <div className="muted">Keine weiteren Spieler vorhanden.</div>
          ) : (
            otherPlayers.map((player) => (
              <div key={player.id} className="skyjo-other-player card">
                <div className="section-header">
                  <div>
                    <div className="eyebrow">Spieler</div>
                    <h3 className="skyjo-player-title">{player.id}</h3>
                  </div>
                  <div className="muted small">Punkte: {player.points ?? 0}</div>
                </div>
                <PlayerField player={player} compact />
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Antwort / Fehler">
        <ResultBox value={game} error={error} />
      </SectionCard>

      <SectionCard title="Navigation">
        <div className="home-actions">
          <button className="secondary-button" onClick={() => navigate('/')}>
            Zur Hauptseite
          </button>
          <button className="secondary-button" onClick={loadGame}>
            Spiel neu laden
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

function PlayerField({ player, selectable = false, revealOnly = false, compact = false, onCardClick }) {
  const cards = player?.playField?.cards || [];

  return (
    <div className={`skyjo-board ${compact ? 'compact' : ''}`}>
      {cards.map((card, index) => {
        const disabled = revealOnly ? card.revealed : false;
        const className = [
          'skyjo-card-tile',
          card?.revealed ? 'revealed' : 'hidden',
          selectable && !disabled ? 'selectable' : '',
          disabled ? 'disabled' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={`${player?.id || 'player'}-${index}`}
            type="button"
            className={className}
            disabled={!selectable || disabled}
            onClick={() => onCardClick?.(index, card)}
          >
            <span className="small muted">#{index}</span>
            <strong>{card?.revealed ? card?.value : '?'}</strong>
          </button>
        );
      })}
    </div>
  );
}