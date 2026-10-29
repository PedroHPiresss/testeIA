import { useEffect, useState } from 'react';
import { getCardDefinition } from './game/cards';
import { playBotTurn } from './game/bot';
import { playCard } from './game/engine';
import { createInitialState } from './game/state';
import type { CardInstance, GameState } from './game/types';
import {
  createArenaGame,
  finishArenaPlanning,
  listLegalArenaMoves,
  playArenaCard,
  runBotPlanning,
} from './game/foundation/arena-game';
import type { CombatDamageEvent } from './game/foundation/combat';
import type { DuelState } from './game/foundation/types';

interface CombatRoundLog {
  readonly id: number;
  readonly lines: readonly string[];
}

function ArenaGame({ initialState, onBack, onRestart }: {
  readonly initialState: DuelState;
  readonly onBack: () => void;
  readonly onRestart: () => void;
}) {
  const [state, setState] = useState(() => initialState);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [message, setMessage] = useState('Sua partida começou. Selecione uma carta e escolha uma posição vazia.');
  const [roundActions, setRoundActions] = useState<readonly string[]>([]);
  const [history, setHistory] = useState<readonly CombatRoundLog[]>([]);
  const legalMoves = listLegalArenaMoves(state, 'human');
  const humanTurn = state.phase === 'planning' && state.activePlayerId === 'human';

  function describeEvent(event: CombatDamageEvent, before: DuelState): string {
    const attacker = before.players.flatMap((player) => player.field.cells).find((card) => card?.instanceId === event.attackerId);
    const cardTarget = before.players.flatMap((player) => player.field.cells).find((card) => card?.instanceId === event.targetId);
    const leaderTarget = before.players.find((player) => player.leader.instanceId === event.targetId)?.leader;
    const attackerName = attacker?.definition.name ?? event.attackerId;
    const targetName = cardTarget?.definition.name ?? leaderTarget?.definition.name ?? event.targetId;
    return `${attackerName} causou ${event.damage} de dano a ${targetName}${event.targetType === 'leader' ? ' (Líder)' : ''}.`;
  }

  function commitAdvance(
    transition: ReturnType<typeof finishArenaPlanning>,
    beforeCombat: DuelState,
    pendingAction?: string,
  ) {
    if (!transition.ok) {
      setMessage(transition.error === 'game-finished' ? 'A partida já terminou.' : 'Não foi possível encerrar esta etapa.');
      return;
    }
    setState(transition.state);
    if (transition.combatResolved) {
      const lines = [...roundActions, ...(pendingAction ? [pendingAction] : []), ...transition.combatEvents.map((event) => describeEvent(event, beforeCombat))];
      const nextCardIds = new Set(transition.state.players.flatMap((player) => player.field.cells.flatMap((card) => card ? [card.instanceId] : [])));
      for (const player of beforeCombat.players) {
        for (const card of player.field.cells) {
          if (card && !nextCardIds.has(card.instanceId)) lines.push(`${card.definition.name} foi eliminada.`);
        }
      }
      if (transition.state.outcome) {
        lines.push(transition.state.outcome === 'draw'
          ? 'Os dois Líderes foram derrotados: a partida terminou empatada.'
          : `${transition.state.players.find((player) => player.id === transition.state.outcome)?.leader.definition.name} venceu.`);
      }
      if (transition.roundAdvanced) {
        lines.push(`Início da rodada ${transition.state.round}. Os dois participantes receberam renda e compraram uma carta.`);
      }
      setHistory([{ id: beforeCombat.round, lines: lines.length ? lines : ['Nenhuma carta atacou nesta rodada.'] }, ...history]);
      setRoundActions([]);
      setMessage(transition.state.outcome ? 'Partida encerrada.' : `Combate da rodada ${beforeCombat.round} resolvido.`);
    } else {
      setMessage(transition.state.activePlayerId === 'human'
        ? 'O bot concluiu sua preparação. Sua vez: escolha uma carta ou passe.'
        : 'Preparação encerrada. O bot está concluindo sua oportunidade de jogada.');
    }
  }

  useEffect(() => {
    if (state.phase !== 'planning' || state.activePlayerId !== 'bot') return;
    setMessage('Bot preparando: escolhendo uma jogada legal com a própria mão e recursos.');
    const timer = window.setTimeout(() => {
      const response = runBotPlanning(state);
      if (!response.transition.ok) {
        setMessage('O bot não conseguiu concluir sua preparação.');
        return;
      }
      if (response.move) {
        const card = state.players.find((player) => player.id === 'bot')?.hand.find((item) => item.instanceId === response.move?.cardId);
        const placement = response.move.position;
        const action = `Bot posicionou ${card?.definition.name ?? 'uma carta'} na fileira ${placement.row + 1}, coluna ${placement.column + 1}.`;
        setRoundActions((previous) => [...previous, action]);
        commitAdvance(response.transition, response.combatInputState, action);
      } else {
        const action = 'Bot passou: não havia jogada legal com a mão e os recursos atuais.';
        setRoundActions((previous) => [...previous, action]);
        commitAdvance(response.transition, response.combatInputState, action);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [state]);

  function placeSelectedCard(row: number, column: number) {
    if (!selectedCardId || !humanTurn) return;
    const result = playArenaCard(state, 'human', selectedCardId, { row, column });
    if (!result.ok) {
      const friendly = result.error === 'insufficient-resources' ? 'Você não tem recursos suficientes.'
        : result.error === 'position-occupied' ? 'Essa posição já está ocupada.'
          : result.error === 'card-not-in-hand' ? 'Essa carta não está na sua mão.' : 'Essa jogada não é permitida agora.';
      setMessage(friendly);
      return;
    }
    setState(result.state);
    setSelectedCardId(null);
    setRoundActions((previous) => [...previous, `Você posicionou ${result.card.definition.name} na fileira ${row + 1}, coluna ${column + 1}, pagando ${result.card.definition.cost} recursos.`]);
    setMessage(`${result.card.definition.name} posicionada. Encerre sua preparação para dar a vez ao bot.`);
  }

  function endHumanPlanning() {
    const transition = finishArenaPlanning(state, 'human');
    commitAdvance(transition, state);
  }

  return (
    <main className="app-shell combat-screen">
      <header className="game-header">
        <div>
          <p className="eyebrow">Versão 1.0 · Arena jogável</p>
          <h1>Arena de combate</h1>
          <p className="intro">Uma carta ou passe por participante a cada rodada; combate após as duas preparações.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button" onClick={onRestart}>Reiniciar partida</button>
          <button className="secondary-button" type="button" onClick={onBack}>Voltar ao menu</button>
        </div>
      </header>

      <div className="arena-roundbar">
        <strong>Rodada {state.round}</strong>
        <span>Fase: {state.phase === 'finished' ? 'encerrada' : 'preparação'}</span>
        <span role="status">{state.phase === 'finished' ? 'Partida encerrada' : state.activePlayerId === 'human' ? 'Sua vez' : 'Bot preparando'}</span>
      </div>
      <div className="combat-status" role="status">{message}</div>
      {state.outcome && <section className="result-panel combat-result" role="alert">
        <h2>{state.outcome === 'draw' ? 'Partida empatada' : `${state.players.find((player) => player.id === state.outcome)?.leader.definition.name} venceu`}</h2>
        <p>Reinicie pelo menu para começar uma nova partida.</p>
      </section>}

      <section className="combat-boards" aria-label="Campos de combate">
        {state.players.map((player, playerIndex) => (
          <article className="combat-player" key={player.id}>
            <header className="combat-player-header">
              <div><span className="player-label">{playerIndex === 0 ? 'Jogador humano' : 'Adversário'}</span><h2>{player.leader.definition.name}</h2></div>
              <strong className="leader-health">♥ {player.leader.currentHealth}</strong>
            </header>
            <p className="arena-resources">Recursos: <strong>{player.resources}</strong> · Mão: {player.id === 'human' ? player.hand.length : `${player.hand.length} cartas`} · Baralho: {player.deck.length}</p>
            <div className="combat-grid" role="grid" aria-label={`Campo de ${player.leader.definition.name}`}>
              {player.field.cells.map((card, index) => {
                const row = Math.floor(index / 4);
                const column = index % 4;
                const targetIsLegal = player.id === 'human' && !card && selectedCardId !== null
                  && legalMoves.some((move) => move.cardId === selectedCardId && move.position.row === row && move.position.column === column);
                const cellLabel = `Fileira ${row + 1}, coluna ${column + 1}${card ? `: ${card.definition.name}` : ': vazia'}`;
                return <button
                  className={`combat-cell${card ? ' occupied' : ''}${targetIsLegal ? ' valid-placement' : ''}`}
                  type="button"
                  role="gridcell"
                  key={`${row}-${column}`}
                  aria-label={cellLabel}
                  disabled={player.id !== 'human' || !humanTurn || !!card || !targetIsLegal}
                  onClick={() => placeSelectedCard(row, column)}
                >
                  <span className="cell-coordinate">{row + 1}·{column + 1}</span>
                  {card ? <>
                    <strong>{card.definition.name}</strong>
                    <span>{card.definition.baseClass === 'troop' ? 'Tropa' : 'Escudo'}</span>
                    <span>ATQ {card.definition.attack} · DEF {card.currentDefense}</span>
                  </> : <span className="empty-cell">{targetIsLegal ? 'Posicionar aqui' : 'Vazia'}</span>}
                </button>;
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="arena-hand hand-area" aria-labelledby="arena-hand-title">
        <div className="hand-heading"><h2 id="arena-hand-title">Sua mão</h2><span>Escolha uma carta; espaços legais ficam destacados.</span></div>
        <div className="human-hand">
          {state.players[0].hand.map((card) => {
            const affordable = card.definition.cost <= state.players[0].resources;
            const canSelect = humanTurn && !state.actedPlayerIds.includes('human') && affordable && legalMoves.some((move) => move.cardId === card.instanceId);
            return <button
              className={`playing-card arena-card${selectedCardId === card.instanceId ? ' selected' : ''}`}
              type="button"
              key={card.instanceId}
              aria-pressed={selectedCardId === card.instanceId}
              aria-label={`${card.definition.name}, ${card.definition.baseClass === 'troop' ? 'Tropa' : 'Escudo'}, Ataque ${card.definition.attack}, Defesa ${card.currentDefense}, custo ${card.definition.cost}`}
              disabled={!canSelect}
              onClick={() => setSelectedCardId(card.instanceId)}
            >
              <span className="card-name">{card.definition.name}</span>
              <span>{card.definition.baseClass === 'troop' ? 'Tropa' : 'Escudo'}</span>
              <span>ATQ {card.definition.attack} · DEF {card.currentDefense}</span>
              <span>Custo {card.definition.cost}{affordable ? '' : ' · recursos insuficientes'}</span>
            </button>;
          })}
          {state.players[0].hand.length === 0 && <p className="empty-hand">Sua mão está vazia; você pode passar.</p>}
        </div>
        <div className="arena-actions">
          <p>{selectedCardId ? 'Agora selecione uma posição vazia destacada no seu campo.' : 'Você pode fazer uma jogada ou passar nesta rodada.'}</p>
          <button className="primary-button" type="button" disabled={!humanTurn} onClick={endHumanPlanning}>Encerrar preparação</button>
        </div>
      </section>

      <section className="history-panel combat-log" aria-labelledby="combat-log-title">
        <h2 id="combat-log-title">Histórico da partida</h2>
        {history.length === 0 ? <p>As jogadas e resoluções aparecerão aqui.</p> : <ol>{history.flatMap((round) => [
          <li className="round-heading" key={`round-${round.id}`}>Rodada {round.id}</li>,
          ...round.lines.map((line, index) => <li key={`${round.id}-${index}`}>{line}</li>),
        ])}</ol>}
      </section>
    </main>
  );
}

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
  const [screen, setScreen] = useState<'menu' | 'game' | 'arena'>('menu');
  const [showRules, setShowRules] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);
  const [arenaState, setArenaState] = useState<DuelState | null>(null);

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

  function startArenaGame() {
    setArenaState(createArenaGame(seed));
    setSeed((current) => current + 1);
    setScreen('arena');
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
            <button className="secondary-button" type="button" onClick={startArenaGame}>Arena jogável (teste)</button>
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

  if (screen === 'arena' && arenaState) {
    return <ArenaGame key={seed} initialState={arenaState} onBack={() => setScreen('menu')} onRestart={startArenaGame} />;
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
