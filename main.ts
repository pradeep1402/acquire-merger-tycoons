import { createApp } from "./src/app.ts";
import { Acquire } from "./src/models/game.ts";

const main = async () => {
  const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
  const players: string[] = [
    "Adi",
    "Krishna",
    "Siddique",
    "Pragna",
    "Liki",
    "Sudheer",
  ];

  const acquire = new Acquire(tiles, players);
  const app = createApp(acquire);

  const port: number = Number(Deno.env.get("PORT")) | 3000;
  Deno.serve({ port }, app.fetch);
};

main();
