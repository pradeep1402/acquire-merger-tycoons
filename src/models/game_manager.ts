import { CurrentGame } from "./CurrentGame.ts";

import { Hotel } from "./hotel.ts";
import _ from "lodash";
import { StdGame } from "./stdGame.ts";
import { Player } from "./player.ts";
import { Board } from "./board.ts";

export const createHotels = (): Hotel[] => {
  const hotelTexts = `Tower:0,Sackson:0,
    Festival:1,American:1,Worldwide:1,
    Imperial:2,Continental:2`.split(",");

  const toHotel = (text: string) => {
    const [name, rankText] = text.trim().split(":");
    return new Hotel(name, +rankText);
  };

  return _.map(hotelTexts, toHotel);
};

const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
const generateShuffledTiles = () => _.shuffle(tiles);

class GameManager {
  private gamesMap: Map<string, StdGame>;
  private gameStateMap: Map<string, CurrentGame>;
  private tileGenerator: () => string[];
  private hotels: () => Hotel[];
  devMode: boolean;
  gameScenario: StdGame | undefined;

  constructor(
    tileGenerator: () => string[] = generateShuffledTiles,
    hotelGenerator: () => Hotel[] = createHotels, //creating new hotels here
  ) {
    this.tileGenerator = tileGenerator;
    this.gamesMap = new Map();
    this.hotels = hotelGenerator;
    this.gameScenario = undefined;
    this.gameStateMap = new Map();
    this.devMode = false;
  }

  // deno-lint-ignore no-explicit-any
  setScenario(data: any) {
    this.gameScenario = StdGame.fromJSON(data);
    this.devMode = true;
  }

  private createPlayers(playerIds: string[]): Player[] {
    return playerIds.map((playerId) => new Player(playerId));
  }

  createGame(gameId: string, playerIds: string[]): StdGame {
    const game = this.gameScenario ||
      new StdGame(
        this.tileGenerator(),
        this.createPlayers(playerIds),
        new Board(this.hotels()),
      );

    const currentGame = new CurrentGame(game);
    this.gamesMap.set(gameId, game);
    this.gameStateMap.set(gameId, currentGame);

    return game;
  }

  getGame(gameId: string): StdGame | undefined {
    return this.gamesMap.get(gameId);
  }

  getCurrentGame(gameId: string): CurrentGame | undefined {
    return this.gameStateMap.get(gameId);
  }
}

export { GameManager };
