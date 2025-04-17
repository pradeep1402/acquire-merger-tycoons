import { Context } from "hono";
import { setCookie } from "hono/cookie";

export const servePlayers = (ctx: Context): Response => {
  const acquire = ctx.get("acquire");

  return ctx.json(acquire.getAllPlayers());
};

export const serveGameBoard = (ctx: Context): Response => {
  const game = ctx.get("acquire");

  return ctx.json(game.getBoard());
};

export const handleLogin = async (ctx: Context): Promise<Response> => {
  const fd = await ctx.req.formData();
  const sessions = ctx.get("sessions");
  const playerName = fd.get("playerName") as string;

  sessions.add(playerName);
  setCookie(ctx, "sessionId", playerName);

  return ctx.redirect("/", 303);
};
