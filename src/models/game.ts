export type Player = { id: number; name: string };

class Acquire {
  id: string;
  players: Player[] = [{ id: 1, name: "Siddhik" }];

  constructor(players: Player[]) {
    this.id = "1";
    this.players = players;
  }
}

export { Acquire };
