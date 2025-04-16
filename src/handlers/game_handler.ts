import { Context } from "hono";

export const servePlayers = (ctx: Context): Response => {
  const acquire = ctx.get("acquire");

  return ctx.json(acquire.players);
};

export const serveGameBoard = (ctx: Context): Response => {
  const game = ctx.get("acquire");

  return ctx.json(game.getBoard());
};
