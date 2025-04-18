import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export const servePlayers = (ctx: Context): Response => {
  const acquire = ctx.get("game");
  const sessions = ctx.get("sessions");
  const sessionId = getCookie(ctx, "sessionId");

  const players = acquire.getAllPlayers().map((player: { id: string }) => {
    if (player.id === sessionId) return "you";
    return sessions.getPlayerName(player.id);
  });

  return ctx.json(players);
};

export const serveGameBoard = (ctx: Context): Response => {
  const game = ctx.get("game");

  return ctx.json(game.getBoard());
};

export const handleLogin = async (ctx: Context): Promise<Response> => {
  const fd = await ctx.req.formData();
  const sessions = ctx.get("sessions");
  const playerName = fd.get("playerName") as string;
  const playerId = sessions.addPlayer(playerName);
  setCookie(ctx, "sessionId", playerId);

  return ctx.redirect("/", 303);
};

export const servePlayerDetails = (ctx: Context): Response => {
  const game = ctx.get("game");
  const name = ctx.get("username");
  const sessionId = ctx.get("sessionId");
  const playerDetails = game.getPlayer(sessionId);

  return ctx.json({ ...playerDetails, name });
};

export const serveGameStatus = (ctx: Context): Response => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager = ctx.get("gameManager");
  const gameStatus = gameManager.getGame(gameId);
  const sessions = ctx.get("sessions");

  if (gameStatus) {
    return ctx.json({ status: "START" });
  }

  const players = sessions.getWaitingPlayers();

  return ctx.json(players);
};

export const handleQuickPlay = (ctx: Context): Response => {
  const sessions = ctx.get("sessions");
  const sessionId = ctx.get("sessionId");
  const gameManager = ctx.get("gameManager");
  const { gameId } = sessions.addToWaitingList(sessionId, gameManager);
  setCookie(ctx, "gameId", gameId);

  return ctx.json(gameId);
};
