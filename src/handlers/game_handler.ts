import { Context } from "hono";
import { setCookie } from "hono/cookie";

export const servePlayers = (ctx: Context): Response => {
  const acquire = ctx.get("game");
  const sessions = ctx.get("sessions");
  const players = acquire
    .getAllPlayers()
    .map((player: { name: string }) => sessions.getPlayerName(player.name));

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

// export const serveGameStatus = (ctx: Context): Response => {
//   const { gameId } = getCookie(ctx);
//   const gameManager = ctx.get("gameManager");
//   const game = gameManager.getGame(gameId);

//   return ctx.json(game);
// export const handleQuickPlay = (ctx: Context): Response => {
//   const session = ctx.get("session");

//   return ctx.json(session.addToWaitingList());
// };
