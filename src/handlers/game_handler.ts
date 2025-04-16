import { Context } from "hono";

export const servePlayers = (context: Context) => {
  const acquire = context.get("acquire");

  return context.json(acquire.players);
};
