import { GameManager } from "./game_manager.ts";

export class Sessions {
  private sessions: Map<string, { name: string; status: string }>;
  private waiting: { gameId: string; playerIds: string[] };
  private idGenerator: () => string;

  constructor(idGenerator: () => string) {
    this.idGenerator = idGenerator;
    this.sessions = new Map();
    this.waiting = { gameId: this.idGenerator(), playerIds: [] };
  }

  addPlayer(name: string): string {
    const playerId = this.idGenerator();

    this.sessions.set(playerId, { name, status: "LoggedIn" });

    return playerId;
  }

  addToWaitingList(playerId: string) {
    const player = this.sessions.get(playerId);
    if (player) player.status = "Waiting";

    if (this.waiting.playerIds.length < 3) {
      this.waiting.playerIds.push(playerId);
      return { playerId, gameId: this.waiting.gameId };
    }

    this.waiting.gameId = this.idGenerator();
    this.waiting.playerIds = [playerId];

    return { playerId, gameId: this.waiting.gameId };
  }

  createRoom(gameManager: GameManager) {
    if (this.waiting.playerIds.length === 3) {
      const { playerIds, gameId } = this.waiting;

      gameManager.createGame(gameId, playerIds);
      return { status: "START" };
    }

    const players = this.waiting.playerIds.map((playerId) =>
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
