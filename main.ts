import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/game_manager.ts";
import { Sessions } from "./src/models/sessions.ts";

const main = async () => {
  const tiles = JSON.parse(await Deno.readTextFile("./src/data/tiles.json"));
  const idGenerator = () => Date.now().toString();
  const sessions = new Sessions(idGenerator);
  const gameManager = new GameManager(tiles);
  const app = createApp(sessions, gameManager);

  const port: number = Number(Deno.env.get("PORT")) || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
//test commit hook
