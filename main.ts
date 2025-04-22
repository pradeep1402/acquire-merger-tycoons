import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/game_manager.ts";
import { Sessions } from "./src/models/sessions.ts";
import { Hotel } from "./src/models/hotel.ts";
import _ from "lodash";

const getHotels = (): Hotel[] => {
  const Imperial = new Hotel("Imperial", "orange", 2);
  const Continental = new Hotel("Continental", "sky-blue", 2);
  const Worldwide = new Hotel("Worldwide", "purple", 1);
  const Tower = new Hotel("Tower", "yellow", 0);
  const Sackson = new Hotel("Sackson", "red", 0);
  const Festival = new Hotel("Festival", "green", 1);
  const American = new Hotel("American", "violet", 1);

  return [Imperial, Continental, Worldwide, Tower, Sackson, Festival, American];
};

const main = async () => {
  const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
  const idGenerator = () => Date.now().toString();
  const sessions = new Sessions(idGenerator);
  const tileGenerator = () => _.shuffle(tiles);
  const gameManager = new GameManager(tileGenerator, getHotels());
  const app = createApp(sessions, gameManager);

  const port: number = Number(Deno.env.get("PORT")) || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
