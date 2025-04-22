import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/game_manager.ts";
import { Sessions } from "./src/models/sessions.ts";
import { Hotel } from "./src/models/hotel.ts";
import _ from "lodash";

const Imperial = new Hotel("Imperial", "orange");
const Continental = new Hotel("Continental", "sky-blue");
const Worldwide = new Hotel("Worldwide", "purple");
const Tower = new Hotel("Tower", "yellow");
const Sackson = new Hotel("Sackson", "red");
const Festival = new Hotel("Festival", "green");
const American = new Hotel("American", "violet");

const hotels = [
  Imperial,
  Continental,
  Worldwide,
  Tower,
  Sackson,
  Festival,
  American,
];

const main = async () => {
  const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
  const idGenerator = () => Date.now().toString();
  const sessions = new Sessions(idGenerator);
  const tileGenerator = () => _.shuffle(tiles);
  const gameManager = new GameManager(tileGenerator, hotels);
  const app = createApp(sessions, gameManager);

  const port: number = Number(Deno.env.get("PORT")) || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
