import { CurrentGame } from "./CurrentGame.ts";
import { Game } from "./game.ts";
import { Hotel } from "./hotel.ts";
import _ from "lodash";

const getHotels = (): Hotel[] => {
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
  private gamesMap: Map<string, Game>;
  private gameStateMap: Map<string, CurrentGame>;
  private tileGenerator: () => string[];
  private hotels: () => Hotel[];

  constructor(
    tileGenerator: () => string[] = generateShuffledTiles,
    hotelGenerator: () => Hotel[] = getHotels,
  ) {
    this.tileGenerator = tileGenerator;
    this.gamesMap = new Map();
    this.hotels = hotelGenerator;
    this.gameStateMap = new Map();
  }

  createGame(gameId: string, playerIds: string[]): Game {
    const game = new Game(this.tileGenerator(), playerIds, this.hotels());
    const currentGame = new CurrentGame(game);
    this.gamesMap.set(gameId, game);
    this.gameStateMap.set(gameId, currentGame);

    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.gamesMap.get(gameId);
  }

  getCurrentGame(gameId: string): CurrentGame | undefined {
    return this.gameStateMap.get(gameId);
  }
}

export { GameManager };
