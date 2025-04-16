class Acquire{
  id: string;
  players: { id: number; name: string }[];
  
  constructor() {
    this.id = "1";
    this.players = [{ id: 1, name: "krishnanand" }];
  }
}

export { Acquire };
