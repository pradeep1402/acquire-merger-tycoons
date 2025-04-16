import { createApp } from "./src/app.ts";

const main = () => {
  Deno.serve({ port: 2616 }, createApp().fetch);
};

main();
