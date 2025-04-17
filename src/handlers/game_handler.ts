import { Context } from "hono";

export const servePlayers = (ctx: Context): Response => {
  const acquire = ctx.get("acquire");

  return ctx.json(acquire.getAllPlayers());
};

export const serveGameBoard = (ctx: Context): Response => {
  const game = ctx.get("acquire");

  return ctx.json(game.getBoard());
};

export const servePlayerDetails = (ctx: Context): Response => {
  const acquire = ctx.get("acquire");

  return ctx.json(acquire.getPlayer());
};
