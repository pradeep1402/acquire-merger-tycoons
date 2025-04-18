import { GameManager } from "./game_manager.ts";

export class Sessions {
  private sessions: Map<string, { name: string; status: string }>;
  private waiting: { gameId: string; players: string[] };
  private idGenerator: () => string;

  constructor(idGenerator: () => string) {
    this.idGenerator = idGenerator;
    this.sessions = new Map();
    this.waiting = { gameId: this.idGenerator(), players: [] };
  }

  addPlayer(name: string): string {
    const playerId = this.idGenerator();

    this.sessions.set(playerId, { name, status: "LoggedIn" });

    return playerId;
  }

  addToWaitingList(playerId: string, gameManager: GameManager) {
    const player = this.sessions.get(playerId);
    if (player) player.status = "Waiting";

    const gameId = this.waiting.gameId;

    if (this.waiting.players.length < 2) {
      this.waiting.players.push(playerId);
      return { playerId, gameId };
    }

    this.waiting.players.push(playerId);
    this.createRoom(gameManager);

    return { playerId, gameId };
  }

  createRoom(gameManager: GameManager) {
    const { players, gameId } = this.waiting;
    gameManager.createGame(gameId, players);
    this.waiting = { gameId: this.idGenerator(), players: [] };
  }

  getWaitingPlayers() {
    const players = this.waiting.players.map((playerId) =>
      this.sessions.get(playerId)
    );

    return { gameId: this.waiting.gameId, players };
  }

  getPlayerName(playerId: string): string | null {
    return this.sessions.get(playerId)?.name || null;
  }

  isSessionIdExist(id: string) {
    return this.sessions.has(id);
  }

  removeSession(playerId: string) {
    this.sessions.delete(playerId);
    return "Removed Successfully";
  }
}
