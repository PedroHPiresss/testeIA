import { useEffect, useState } from 'react';
import { getCardDefinition } from './game/cards';
import { playBotTurn } from './game/bot';
import { playCard } from './game/engine';
import { createInitialState } from './game/state';
import type { CardInstance, GameState } from './game/types';

function CardView({ card, selected, onSelect, hidden = false }: {
  readonly card: CardInstance;
  readonly selected: boolean;
  readonly onSelect?: () => void;
  readonly hidden?: boolean;
}) {
  const definition = getCardDefinition(card.definitionId);
  const content = (
    <>
      <span className="card-value">{definition.value}</span>
      <span className="card-name">{definition.name}</span>
      <span className="card-description">{definition.description}</span>
    </>
  );

  return onSelect ? (
    <button
      className={`playing-card${selected ? ' selected' : ''}`}
      type="button"
      aria-pressed={selected}
      aria-label={`${definition.name}, ${definition.value} pontos`}
      onClick={onSelect}
    >
      {content}
    </button>
  ) : hidden
    ? <div className="playing-card card-back" aria-label="Carta oculta">?</div>
    : <div className="playing-card discard-card" aria-label={`${definition.name}, ${definition.value} pontos`}>{content}</div>;
}

function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [showRules, setShowRules] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    if (!game || game.status !== 'active' || game.currentPlayerId !== 'bot') return;
    const timer = window.setTimeout(() => {
      const result = playBotTurn(game);
      if (result?.ok) setGame(result.state);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [game]);

  function startGame() {
    setGame(createInitialState(seed));
    setSeed((current) => current + 1);
    setSelectedCardId(null);
    setScreen('game');
  }

  function confirmPlay() {
    if (!game || !selectedCardId) return;
    const result = playCard(game, 'human', selectedCardId);
    if (result.ok) {
      setGame(result.state);
      setSelectedCardId(null);
    }
  }

  if (screen === 'menu') {
    return (
      <main className="app-shell menu-screen">
        <section className="menu-card" aria-labelledby="app-title">
          <p className="eyebrow">Protótipo 0.1 · regras temporárias</p>
          <h1 id="app-title">Card Game Laboratory</h1>
          <p className="intro">Uma partida local para testar a fundação do motor de cartas.</p>
          <div className="menu-actions">
            <button className="primary-button" type="button" onClick={startGame}>Iniciar partida</button>
            <button className="secondary-button" type="button" onClick={() => setShowRules(true)}>Ver regras</button>
          </div>
          {showRules && (
            <section className="rules-panel" role="dialog" aria-modal="true" aria-labelledby="rules-title">
              <h2 id="rules-title">Regras provisórias</h2>
              <p>Jogue uma carta por turno e some o valor dela. Quem alcançar 10 pontos vence. Cada lado começa com três cartas; após jogar, compra uma se o baralho ainda tiver cartas.</p>
              <p>O adversário joga a carta de maior valor. Estas regras servem somente para o protótipo.</p>
              <button className="secondary-button" type="button" onClick={() => setShowRules(false)}>Fechar regras</button>
            </section>
          )}
        </section>
      </main>
    );
  }

  if (!game) return null;
  const human = game.players.human;
  const bot = game.players.bot;
  const latestPlayed = [...game.history].reverse().find((event) => event.cardName);
  const latestDiscard = latestPlayed ? game.players[latestPlayed.playerId].discard.at(-1) : undefined;
  const isHumanTurn = game.status === 'active' && game.currentPlayerId === 'human';

  return (
    <main className="app-shell game-screen">
      <header className="game-header">
        <div>
          <p className="eyebrow">Card Game Laboratory · Protótipo 0.1</p>
          <h1>Partida de cartas</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button" onClick={startGame}>Reiniciar</button>
          <button className="secondary-button" type="button" onClick={() => setScreen('menu')}>Voltar ao menu</button>
        </div>
      </header>

      <section className="scoreboard" aria-label="Placar">
        <article className={`player-panel${game.currentPlayerId === 'bot' && game.status === 'active' ? ' active-player' : ''}`}>
          <div><span className="player-label">Adversário</span><span className="player-score">{bot.score}</span></div>
          <p>{bot.hand.length} cartas na mão · {bot.deck.length} no baralho</p>
          <div className="opponent-hand" aria-label={`${bot.hand.length} cartas ocultas`}>
          {bot.hand.map((card) => <CardView key={card.instanceId} card={card} selected={false} hidden />)}
          </div>
        </article>
        <div className="turn-indicator" role="status">
          {game.status === 'finished'
            ? game.winnerId === 'draw' ? 'Partida empatada' : game.winnerId === 'human' ? 'Você venceu!' : 'Adversário venceu!'
            : isHumanTurn ? 'Sua vez' : 'Vez do adversário'}
        </div>
        <article className={`player-panel${isHumanTurn ? ' active-player' : ''}`}>
          <div><span className="player-label">Você</span><span className="player-score">{human.score}</span></div>
          <p>{human.hand.length} cartas na mão · {human.deck.length} no baralho</p>
        </article>
      </section>

      <section className="table-area">
        <div className="table-info">
          <div className="discard-area"><h2>Descarte</h2>
            {latestDiscard && <CardView card={latestDiscard} selected={false} />}
            {latestPlayed ? <p>{latestPlayed.message}</p> : <p>Nenhuma carta jogada ainda.</p>}
          </div>
          <p className="deck-summary">Baralhos: você {human.deck.length} · adversário {bot.deck.length}</p>
        </div>
        {game.status === 'finished' && (
          <div className="result-panel" role="alert">
            <h2>{game.winnerId === 'draw' ? 'Empate' : game.winnerId === 'human' ? 'Você venceu!' : 'Adversário venceu!'}</h2>
            <p>Placar final: você {human.score} × {bot.score} adversário</p>
            <button className="primary-button" type="button" onClick={startGame}>Jogar novamente</button>
          </div>
        )}
      </section>

      <section className="hand-area" aria-labelledby="hand-title">
        <div className="hand-heading"><h2 id="hand-title">Sua mão</h2><span>Selecione uma carta e confirme a jogada</span></div>
        <div className="human-hand">
          {human.hand.map((card) => (
            <CardView
              key={card.instanceId}
              card={card}
              selected={selectedCardId === card.instanceId}
              onSelect={() => isHumanTurn && setSelectedCardId(card.instanceId)}
            />
          ))}
          {human.hand.length === 0 && <p className="empty-hand">Sem cartas na mão.</p>}
        </div>
        <button className="primary-button play-button" type="button" disabled={!isHumanTurn || !selectedCardId} onClick={confirmPlay}>
          Jogar carta selecionada
        </button>
      </section>

      <section className="history-panel" aria-labelledby="history-title">
        <h2 id="history-title">Histórico da partida</h2>
        {game.history.length === 0 ? <p>As jogadas aparecerão aqui.</p> : (
          <ol>{[...game.history].reverse().slice(0, 6).map((event) => <li key={event.id}>{event.message}</li>)}</ol>
        )}
      </section>
    </main>
  );
}

export default App;
