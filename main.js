import { createApp } from "./src/app.js";

const main = () => {
  Deno.serve({ port: 2616 }, createApp().fetch);
};

main();
