import { createApp } from "./src/app.ts";
import { Acquire } from "./src/models/game.ts";

const main = () => {
  const acquire = new Acquire();
  const app = createApp(acquire);
  Deno.serve({ port: 2616 }, app.fetch);
};

main();
