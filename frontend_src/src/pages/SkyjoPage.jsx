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
  const latestRoundRef = useRef(null);
  const hasNavigatedToFinishedRef = useRef(false);

  const [game, setGame] = useState(null);
  const [me, setMe] = useState(null);
  const [turnState, setTurnState] = useState(initialTurnState);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardOverrides, setCardOverrides] = useState({});

  async function loadGame({ showRefreshState = false } = {}) {
    if (!gameId) return null;

    if (showRefreshState) {
      setRefreshing(true);
    }

    try {
      setError('');
      const data = await skyjoApi.getGame(gameId);
      setGame(data);
      return data;
    } catch (err) {
      setError(err.message || 'Skyjo konnte nicht geladen werden');
      throw err;
    } finally {
      if (showRefreshState) {
        setRefreshing(false);
      }
    }
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
        // ignore websocket refresh errors
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

  useEffect(() => {
    if (game?.round == null) return;

    if (latestRoundRef.current !== null && latestRoundRef.current !== game.round) {
      setCardOverrides({});
      setTurnState(initialTurnState);
    }

    latestRoundRef.current = game.round;
  }, [game?.round]);

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

  const displayMyPlayer = useMemo(() => applyOverridesToPlayer(myPlayer, cardOverrides), [myPlayer, cardOverrides]);
  const displayOtherPlayers = useMemo(
    () => otherPlayers.map((player) => applyOverridesToPlayer(player, cardOverrides)),
    [otherPlayers, cardOverrides],
  );

  const isMyTurn = String(game?.currentPlayerId || '') === String(me?.userId || '');

  const isAdmin = useMemo(() => {
    if (!game?.players?.length || !me?.userId) return false;

    const meInGame = game.players.find(
      (player) => String(player.id) === String(me.userId),
    );

    if (!meInGame) return false;

    if (typeof meInGame.isAdmin !== 'undefined') {
      return Boolean(meInGame.isAdmin);
    }

    return String(game.players[0]?.id || '') === String(me.userId);
  }, [game, me]);

  const myAllCardsRevealed = useMemo(
    () => Boolean(myPlayer?.playField?.cards?.length) && myPlayer.playField.cards.every((card) => card?.revealed),
    [myPlayer],
  );

  const isRoundEnded = game?.phase === 'END_ROUND' || game?.phase === 'END';
  const isGameFinished =
    game?.phase === 'END_GAME' ||
    Boolean(game?.players?.some((player) => Number(player?.points || 0) >= 100));

  const gameActionsBlocked =
    isRoundEnded || isGameFinished || myPlayer?.lastMoveDone || myAllCardsRevealed;

  const scoreboard = useMemo(() => {
    const players = game?.players || [];
    return [...players].sort((a, b) => {
      const pointDiff = Number(a?.points || 0) - Number(b?.points || 0);
      if (pointDiff !== 0) return pointDiff;
      return Number(a?.id || 0) - Number(b?.id || 0);
    });
  }, [game]);

  useEffect(() => {
    if (!isGameFinished || !game || hasNavigatedToFinishedRef.current) return;

    const standings = scoreboard.map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      points: Number(player.points || 0),
      isMe: String(player.id) === String(me?.userId || ''),
    }));

    const payload = {
      gameId: game.id,
      round: game.round,
      standings,
    };

    localStorage.setItem('skyjoFinishedGame', JSON.stringify(payload));
    hasNavigatedToFinishedRef.current = true;
    navigate(`/skyjo/${game.id}/finished`, { replace: true, state: payload });
  }, [game, isGameFinished, me, navigate, scoreboard]);

  async function handleDrawFromDrawPile() {
    if (!isMyTurn || actionLoading || gameActionsBlocked) return;

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
    if (!isMyTurn || actionLoading || gameActionsBlocked) return;

    setError('');
    setTurnState({
      stage: 'drawn_from_discard_pile',
      source: 'discard',
      drawnCard: null,
    });
  }

  async function handleAdminRoundDecision(nextRound) {
    if (!game?.id || adminActionLoading || !isAdmin || !isRoundEnded) return;

    setAdminActionLoading(true);
    setError('');

    try {
      await skyjoApi.coordinateRound({
        gameId: Number(game.id),
        token: authToken,
        nextRound,
      });

      setTurnState(initialTurnState);
      setCardOverrides({});
      await loadGame();
    } catch (err) {
      setError(err.message || (nextRound ? 'Neue Runde konnte nicht gestartet werden' : 'Spiel konnte nicht beendet werden'));
    } finally {
      setAdminActionLoading(false);
    }
  }

  async function submitMove({ actionType, cardIndex, fromDrawPile, keepCard, targetCard }) {
    setActionLoading(true);
    setError('');

    const override = createCardOverride({
      game,
      me,
      cardIndex,
      targetCard,
      turnState,
      keepCard,
      fromDrawPile,
    });

    if (override) {
      setCardOverrides((current) => ({
        ...current,
        [override.key]: override.card,
      }));
    }

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
      if (override) {
        setCardOverrides((current) => {
          const next = { ...current };
          delete next[override.key];
          return next;
        });
      }
      setError(err.message || 'Move konnte nicht gesendet werden');
    } finally {
      setActionLoading(false);
    }
  }

  function handleCardClick(cardIndex, card) {
    if (!isMyTurn || actionLoading || !displayMyPlayer || gameActionsBlocked) return;

    if (turnState.stage === 'drawn_from_discard_pile') {
      submitMove({
        actionType: 'DRAW_FROM_DISCARD_PILE',
        cardIndex,
        fromDrawPile: false,
        keepCard: true,
        targetCard: card,
      });
      return;
    }

    if (turnState.stage === 'drawn_from_draw_pile_swap') {
      submitMove({
        actionType: 'DRAW_FROM_DRAW_PILE',
        cardIndex,
        fromDrawPile: true,
        keepCard: true,
        targetCard: card,
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
        targetCard: card,
      });
    }
  }

  function prepareSwapFromDrawPile() {
    if (turnState.stage !== 'drawn_from_draw_pile' || gameActionsBlocked) return;
    setTurnState((current) => ({
      ...current,
      stage: 'drawn_from_draw_pile_swap',
    }));
  }

  function prepareDiscardFromDrawPile() {
    if (turnState.stage !== 'drawn_from_draw_pile' || gameActionsBlocked) return;
    setTurnState((current) => ({
      ...current,
      stage: 'drawn_from_draw_pile_discard',
    }));
  }

  function cancelTurnSelection() {
    if (actionLoading) return;
    setTurnState(initialTurnState);
  }

  const statusText = useMemo(() => {
    if (isGameFinished) return 'Spiel beendet';
    if (isRoundEnded) return isAdmin ? 'Runde beendet – Admin entscheidet' : 'Runde beendet – warte auf den Admin';
    if (myPlayer?.lastMoveDone || myAllCardsRevealed) return 'Dein letzter Zug ist abgeschlossen';
    if (isMyTurn) return 'Du bist am Zug';
    return 'Bitte warten';
  }, [isAdmin, isGameFinished, isMyTurn, isRoundEnded, myAllCardsRevealed, myPlayer?.lastMoveDone]);

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
    <div className="page-grid skyjo-page-layout">
      <div className="skyjo-toolbar card">
        <button
          className={`icon-button ${refreshing ? 'spinning' : ''}`}
          type="button"
          onClick={() => loadGame({ showRefreshState: true })}
          aria-label="Spiel neu laden"
          title="Spiel neu laden"
          disabled={refreshing || adminActionLoading}
        >
          ↻
        </button>

        <div className="skyjo-info-bar">
          <div className="skyjo-info-pill">
            <span className="eyebrow">Runde</span>
            <strong>{game?.round ?? '—'}</strong>
          </div>

          <div className="skyjo-info-pill">
            <span className="eyebrow">Phase</span>
            <strong>{game?.phase ?? '—'}</strong>
          </div>

          <div className="skyjo-info-pill">
            <span className="eyebrow">Aktueller Spieler</span>
            <strong>{currentPlayer?.id ?? '—'}</strong>
          </div>

          <div className="skyjo-info-pill">
            <span className="eyebrow">Du</span>
            <strong>{me?.userId ?? '—'}</strong>
          </div>

          <div className={`skyjo-info-pill ${isMyTurn ? 'active' : ''} ${(isRoundEnded || isGameFinished) ? 'pending' : ''}`}>
            <span className="eyebrow">Status</span>
            <strong>{statusText}</strong>
          </div>
        </div>
      </div>

      <SectionCard title="Punktestand" subtitle="Die Gesamtpunkte werden nach jedem abgeschlossenen Durchgang aktualisiert.">
        <div className="skyjo-scoreboard">
          {scoreboard.map((player, index) => {
            const isSelf = String(player.id) === String(me?.userId || '');
            const isCurrent = String(player.id) === String(currentPlayer?.id || '');
            const isAdminPlayer = Boolean(player?.isAdmin);

            return (
              <div
                key={player.id}
                className={[
                  'skyjo-score-item',
                  isSelf ? 'self' : '',
                  isCurrent ? 'current' : '',
                ].filter(Boolean).join(' ')}
              >
                <div className="skyjo-score-rank">#{index + 1}</div>
                <div className="skyjo-score-meta">
                  <strong>Spieler {player.id}</strong>
                  <span className="muted small">
                    {isSelf ? 'Du' : 'Mitspieler'}{isAdminPlayer ? ' · Admin' : ''}
                  </span>
                </div>
                <div className="skyjo-score-points">{player.points ?? 0} Pkt.</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {isRoundEnded ? (
        <SectionCard
          title={isAdmin ? 'Rundenentscheidung' : 'Warten auf den Admin'}
          subtitle={
            isAdmin
              ? 'Die Runde ist beendet. Entscheide, ob ihr weiterspielt oder das Spiel beendet.'
              : 'Die Runde ist beendet. Der Admin entscheidet jetzt, ob eine weitere Runde gestartet oder das Spiel beendet wird.'
          }
        >
          {isAdmin ? (
            <div className="skyjo-host-actions">
              <button onClick={() => handleAdminRoundDecision(true)} disabled={adminActionLoading}>
                Neues Spiel / nächste Runde starten
              </button>
              <button
                className="secondary-button"
                onClick={() => handleAdminRoundDecision(false)}
                disabled={adminActionLoading}
              >
                Spiel manuell beenden
              </button>
            </div>
          ) : (
            <div className="stat-card skyjo-waiting-card">
              <strong>Bitte warten</strong>
              <p className="muted small">
                Der Admin wählt gerade aus, ob eine weitere Runde gestartet oder das Spiel beendet wird.
              </p>
            </div>
          )}
        </SectionCard>
      ) : null}

      <div className="skyjo-main-layout">
        <aside className="skyjo-sidebar">
          <SectionCard title="Aktionsbereich" subtitle="Ziehe Karten und führe deinen Zug aus.">
            <div className="skyjo-action-panel">
              <div className="skyjo-action-grid-single">
                <div className="skyjo-action-tile stat-card">
                  <div className="skyjo-action-tile-header">
                    <div className="skyjo-action-icon" aria-hidden="true">↓</div>
                    <div>
                      <div className="eyebrow">Nachziehstapel</div>
                      <strong>Karte ziehen</strong>
                    </div>
                  </div>
                  <p className="muted small">
                    Ziehe eine neue Karte vom Nachziehstapel und entscheide danach, ob du sie tauschen oder ablegen
                    möchtest.
                  </p>
                  <button onClick={handleDrawFromDrawPile} disabled={!isMyTurn || actionLoading || gameActionsBlocked}>
                    Vom Nachziehstapel ziehen
                  </button>
                </div>

                <div className="skyjo-action-tile stat-card">
                  <div className="skyjo-action-tile-header">
                    <div className="skyjo-action-icon secondary" aria-hidden="true">↺</div>
                    <div>
                      <div className="eyebrow">Ablagestapel</div>
                      <strong>Oberste Karte nehmen</strong>
                    </div>
                  </div>
                  <p className="muted small">
                    Nimm die sichtbare Karte vom Ablagestapel und tausche sie direkt mit einer Karte aus deinem
                    Spielfeld.
                  </p>
                  <button
                    className="secondary-button"
                    onClick={handleDrawFromDiscardPile}
                    disabled={!isMyTurn || actionLoading || gameActionsBlocked}
                  >
                    Vom Ablagestapel nehmen
                  </button>
                </div>
              </div>

              <div className="skyjo-visible-piles skyjo-visible-piles-sidebar">
                <div className="skyjo-display-stack stat-card">
                  <div className="skyjo-display-header">
                    <div className="skyjo-action-icon" aria-hidden="true">+</div>
                    <div>
                      <div className="eyebrow">Gezogene Karte</div>
                      <div className="skyjo-display-title">Deine aktuelle Auswahl</div>
                    </div>
                  </div>

                  <SkyjoCardVisual card={turnState.drawnCard} placeholder="Noch keine Karte gezogen" large forceRevealed />
                </div>

                <div className="skyjo-display-stack stat-card">
                  <div className="skyjo-display-header">
                    <div className="skyjo-action-icon secondary" aria-hidden="true">↺</div>
                    <div>
                      <div className="eyebrow">Ablagestapel</div>
                      <div className="skyjo-display-title">Oberste sichtbare Karte</div>
                    </div>
                  </div>

                  <SkyjoCardVisual card={game?.discardCard} placeholder="Ablagestapel leer" large forceRevealed />
                </div>
              </div>

              {turnState.stage === 'drawn_from_draw_pile' ? (
                <div className="skyjo-followup-actions">
                  <button onClick={prepareSwapFromDrawPile} disabled={actionLoading || gameActionsBlocked}>
                    Gezogene Karte tauschen
                  </button>
                  <button
                    className="secondary-button"
                    onClick={prepareDiscardFromDrawPile}
                    disabled={actionLoading || gameActionsBlocked}
                  >
                    Gezogene Karte ablegen
                  </button>
                </div>
              ) : null}

              {turnState.stage !== 'idle' ? (
                <div className="skyjo-reset-row">
                  <button className="secondary-button" onClick={cancelTurnSelection} disabled={actionLoading}>
                    Auswahl zurücksetzen
                  </button>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </aside>

        <main className="skyjo-board-area">
          <SectionCard
            title={`Dein Spielfeld · ${displayMyPlayer?.points ?? 0} Punkte`}
            subtitle="3 x 4 Karten – anklickbar, wenn dein aktueller Zug eine Auswahl braucht."
          >
            <PlayerField
              player={displayMyPlayer}
              selectable={isMyTurn && turnState.stage !== 'idle' && !gameActionsBlocked}
              revealOnly={turnState.stage === 'drawn_from_draw_pile_discard'}
              onCardClick={handleCardClick}
            />
          </SectionCard>

          <SectionCard title="Andere Spieler" subtitle="Übersicht der übrigen Spielfelder mit aktuellem Punktestand.">
            <div className="skyjo-other-players">
              {displayOtherPlayers.length === 0 ? (
                <div className="muted">Keine weiteren Spieler vorhanden.</div>
              ) : (
                displayOtherPlayers.map((player) => (
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
        </main>
      </div>
    </div>
  );
}

function PlayerField({ player, selectable = false, revealOnly = false, compact = false, onCardClick }) {
  const cards = player?.playField?.cards || [];

  return (
    <div className={`skyjo-board ${compact ? 'compact' : ''}`}>
      {cards.map((card, index) => {
        const className = ['skyjo-card-tile', card?.revealed ? 'revealed' : 'hidden', selectable ? 'selectable' : '']
          .filter(Boolean)
          .join(' ');

        const clickable = selectable && !(revealOnly && card?.revealed);

        return (
          <button
            key={`${player?.id || 'player'}-${index}`}
            type="button"
            className={className}
            disabled={!clickable}
            onClick={() => onCardClick?.(index, card)}
          >
            <span className="small muted">#{index}</span>
            <SkyjoCardVisual card={card} compact={compact} forceHidden={!card?.revealed} />
          </button>
        );
      })}
    </div>
  );
}

function SkyjoCardVisual({
  card,
  placeholder = '—',
  compact = false,
  large = false,
  forceHidden = false,
  forceRevealed = false,
}) {
  const isEmpty = !card;
  const isHidden = !forceRevealed && (forceHidden || !card?.revealed);
  const value = card?.value;

  const cardClassName = [
    'skyjo-card-visual',
    compact ? 'compact' : '',
    large ? 'large' : '',
    isHidden ? 'hidden' : 'revealed',
    !isHidden ? getValueClassName(value) : '',
    isEmpty ? 'empty' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (isEmpty) {
    return (
      <div className={cardClassName}>
        <div className="skyjo-card-placeholder">{placeholder}</div>
      </div>
    );
  }

  if (isHidden) {
    return (
      <div className={cardClassName}>
        <div className="skyjo-card-back-pattern" />
        <div className="skyjo-card-center-symbol">?</div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div className="skyjo-card-corner top-left">{formatCardValue(value)}</div>
      <div className="skyjo-card-value">{formatCardValue(value)}</div>
      <div className="skyjo-card-corner bottom-right">{formatCardValue(value)}</div>
    </div>
  );
}

function applyOverridesToPlayer(player, overrides) {
  if (!player?.playField?.cards?.length) return player;

  const cards = player.playField.cards.map((card, index) => {
    const key = `${player.id}-${index}`;
    return overrides[key] ? { ...card, ...overrides[key] } : card;
  });

  return {
    ...player,
    playField: {
      ...player.playField,
      cards,
    },
  };
}

function createCardOverride({ game, me, cardIndex, targetCard, turnState, keepCard, fromDrawPile }) {
  const wasAlreadyRevealed = Boolean(targetCard?.revealed);
  if (!wasAlreadyRevealed) return null;

  const replacementCard = fromDrawPile && keepCard ? turnState.drawnCard : game?.discardCard;
  if (!replacementCard) return null;

  return {
    key: `${me?.userId}-${cardIndex}`,
    card: {
      ...replacementCard,
      revealed: true,
    },
  };
}

function formatCardValue(value) {
  if (value === null || value === undefined) return '—';
  if (value > 0) return `+${value}`;
  return String(value);
}

function getValueClassName(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value < 0) return 'negative';
  if (value === 0) return 'zero';
  if (value <= 4) return 'low';
  if (value <= 8) return 'medium';
  return 'high';
}