export class Sessions {
  private sessions: Map<string, { name: string; status: string }>;
  private idGenerator: () => string;

  constructor(idGenerator: () => string) {
    this.idGenerator = idGenerator;
    this.sessions = new Map();
  }

  addPlayer(name: string): string {
    const playerId = this.idGenerator();

    this.sessions.set(playerId, { name, status: "LoggedIn" });

    return playerId;
  }

  getPlayerName(playerId: string): string | null {
    return this.sessions.get(playerId)?.name || null;
  }

  getPlayer(playerId: string) {
    return this.sessions.get(playerId);
  }

  isSessionIdExist(id: string) {
    return this.sessions.has(id);
  }

  removeSession(playerId: string) {
    this.sessions.delete(playerId);
    return "Removed Successfully";
  }

  getSessions(): Map<string, { name: string; status: string }> {
    return this.sessions;
  }
}
