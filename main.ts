import { createApp } from "./src/app.ts";
import { Acquire, Player } from "./src/models/game.ts";

const main = async () => {
  const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
  const players: Player[] = [{ id: 2, name: "krishnanand" }];
  const acquire = new Acquire(tiles, players);
  const app = createApp(acquire);

  Deno.serve({ port: 2616 }, app.fetch);
};

main();
