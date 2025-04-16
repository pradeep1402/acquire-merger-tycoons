export type Player = { id: number; name: string };

class Acquire {
  id: string;
  players: Player[];

  constructor(players: Player[]) {
    this.id = "1";
    this.players = players;
  }
}

export { Acquire };
