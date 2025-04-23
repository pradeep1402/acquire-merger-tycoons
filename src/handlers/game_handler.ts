import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Game } from "../models/game.ts";
import { Sessions } from "../models/sessions.ts";

export const handleLogin = async (ctx: Context): Promise<Response> => {
  const fd = await ctx.req.formData();
  const sessions = ctx.get("sessions");
  const playerName = fd.get("playerName") as string;
  const playerId = sessions.addPlayer(playerName);
  setCookie(ctx, "sessionId", playerId);

  return ctx.redirect("/", 303);
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

export const serveGame = (ctx: Context): Response => {
  const game: Game = ctx.get("game");
  const sessions: Sessions = ctx.get("sessions");
  const sessionId: string = ctx.get("sessionId");

  const { board, playersId, currentPlayerId } = game.getGameStats();
  const playerPortfolio = game.getPlayerDetails(sessionId);
  const isMyTurn = sessionId === currentPlayerId;
  const currentPlayer = sessions.getPlayerName(currentPlayerId);

  const players = playersId.map((playerId: string) => {
    const isTheSamePlayer = sessionId === playerId;
    const name = sessions.getPlayerName(playerId);

    return { name, isTheSamePlayer };
  });

  return ctx.json({ board, players, isMyTurn, currentPlayer, playerPortfolio });
};

export const handlePlaceTile = (ctx: Context) => {
  const game = ctx.get("game");
  const id = ctx.req.param("tile");
  const placeInfo = game.placeTile(id);

  return ctx.json(placeInfo);
};

export const handleFoundingHotel = (ctx: Context) => {
  const game = ctx.get("game");
  const tile = ctx.req.param("tile");
  const hotel = ctx.req.param("hotel");
  const foundedHotel = game.foundHotel(tile, hotel);

  return ctx.json(foundedHotel);
};

export const handleBuyStocks = (ctx: Context) => {
  const game = ctx.get("game");
  const stocks = JSON.parse(ctx.req.header().body);

  const result = game.buyStocks(stocks);
  return ctx.json(result);
};

export const handleEndTurn = (ctx: Context) => {
  const game = ctx.get("game");
  const response = game.changeTurn();
  game;

  return ctx.json(response);
};
