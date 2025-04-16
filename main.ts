import { createApp } from "./src/app.ts";
import { Acquire, Player } from "./src/models/game.ts";

const main = () => {
  const players: Player[] = [{ id: 2, name: "krishnanand" }];
  const acquire = new Acquire(["1A", "2A"], players);
  const app = createApp(acquire);

  Deno.serve({ port: 2616 }, app.fetch);
};

main();
