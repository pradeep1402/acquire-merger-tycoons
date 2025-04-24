import { GameManager } from "./game_manager.ts";

const dateTimeIDGenerator = () => Date.now().toString();

export class Lobby {
  private idGenerator: () => string;
  private waiting: { gameId: string; players: string[] };

  constructor(idGenerator: () => string = dateTimeIDGenerator) {
    this.idGenerator = idGenerator;
    this.waiting = { gameId: this.idGenerator(), players: [] };
  }

  addToWaitingList(
    playerId: string,
    gameManager: GameManager,
    player: { name: string; status: string } | undefined,
  ) {
    if (player) player.status = "Waiting";

    const gameId = this.waiting.gameId;

    this.waiting.players.push(playerId);
    if (this.waiting.players.length < 3) {
      return { playerId, gameId };
    }

    this.createRoom(gameManager);

    return { playerId, gameId };
  }

  private createRoom(gameManager: GameManager) {
    const { players, gameId } = this.waiting;
    gameManager.createGame(gameId, players);
    this.waiting = { gameId: this.idGenerator(), players: [] };
  }

  getWaitingPlayers(sessions: Map<string, { name: string; status: string }>) {
    const players = this.waiting.players.map((playerId) =>
      sessions.get(playerId)
    );

    return { gameId: this.waiting.gameId, players };
  }
}
