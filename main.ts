import { createApp } from "./src/app.ts";
import { GameManager } from "./src/models/game_manager.ts";
import { Sessions } from "./src/models/sessions.ts";
import { Lobby } from "./src/models/lobby.ts";

const main = () => {
  const idGenerator = () => Date.now().toString();
  const sessions = new Sessions(idGenerator);
  const lobby = new Lobby();
  const gameManager = new GameManager();
  const app = createApp(sessions, gameManager, lobby);

  const port: number = Number(Deno.env.get("PORT")) || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
