import { GameManager } from "./game_manager.ts";

export class Sessions {
  private sessions: Map<string, string>;
  private waiting: { gameId: string; players: string[] };
  private idGenerator: () => string;

  constructor(idGenerator: () => string) {
    this.idGenerator = idGenerator;
    this.sessions = new Map();
    this.waiting = { gameId: this.idGenerator(), players: [] };
  }

  addPlayer(name: string): { gameId: string; playerId: string } {
    const playerId = this.idGenerator();
    this.sessions.set(playerId, name);

    if (this.waiting.players.length < 3) {
      this.waiting.players.push(playerId);
      return { playerId, gameId: this.waiting.gameId };
    }

    this.waiting.gameId = this.idGenerator();
    this.waiting.players = [playerId];

    return { playerId, gameId: this.waiting.gameId };
  }

  createRoom(gameManager: GameManager) {
    if (this.waiting.players.length === 3) {
      const { players, gameId } = this.waiting;
      gameManager.createGame(gameId, players);
      return "GAME STARTED";
    }

    return "WAITING...";
  }

  getPlayerName(playerId: string): string {
    return this.sessions.get(playerId) || "Invalid Session Id...";
  }

  removeSession(playerId: string) {
    this.sessions.delete(playerId);
    return "Removed Successfully";
  }
}
