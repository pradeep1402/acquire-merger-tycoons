import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Game } from "../models/game.ts";
import { Sessions } from "../models/sessions.ts";
import { Lobby } from "../models/lobby.ts";
import { StdGame } from "../models/stdGame.ts";
import { HotelName } from "../models/player.ts";

function* idMaker() {
  let index = 10;
  while (true) {
    yield (index += 10);
  }
}

const gen = idMaker();

export const handleLogin = async (ctx: Context): Promise<Response> => {
  const fd = await ctx.req.formData();
  const sessions = ctx.get("sessions");
  const playerName = fd.get("playerName") as string;
  const gameManager = ctx.get("gameManager");

  if (gameManager.devMode) {
    const playerId = String(gen.next().value);
    sessions.addTestingPlayer(playerName, playerId);
    setCookie(ctx, "sessionId", playerId);

    return ctx.redirect("/", 303);
  }

  const playerId = sessions.addPlayer(playerName);
  setCookie(ctx, "sessionId", playerId);

  return ctx.redirect("/", 303);
};

export const serveGameStatus = (ctx: Context): Response => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager = ctx.get("gameManager");
  const gameStatus = gameManager.getGame(gameId);
  const sessions = ctx.get("sessions") as Sessions;

  const lobby = ctx.get("lobby") as Lobby;

  if (gameStatus) {
    return ctx.json({ status: "START" });
  }

  const players = lobby.getWaitingPlayers(sessions.getSessions());

  return ctx.json(players);
};

export const loadScenario = async (ctx: Context): Promise<Response> => {
  const gameManager = ctx.get("gameManager");
  const filePath = ctx.req.param("scenario");

  const data = await Deno.readTextFile(
    `src/data/testScenario/${filePath}.json`,
  );

  gameManager.setScenario(JSON.parse(data));
  return ctx.text(`created a scenario of ${filePath}`);
};

export const handleQuickPlay = (ctx: Context): Response => {
  const sessions = ctx.get("sessions") as Sessions;
  const lobby = ctx.get("lobby") as Lobby;
  const sessionId = ctx.get("sessionId");
  const player = sessions.getPlayer(sessionId);
  const gameManager = ctx.get("gameManager");
  const { gameId } = lobby.addToWaitingList(sessionId, gameManager, player);
  setCookie(ctx, "gameId", gameId);

  return ctx.json(gameId);
};

export const serveGame = (ctx: Context): Response => {
  const game: StdGame = ctx.get("game");
  const sessions: Sessions = ctx.get("sessions");
  const sessionId: string = ctx.get("sessionId");

  const { board, playersId, currentPlayerId, isGameEnd, mergeData, mode } = game
    .getGameStats();
  const playerPortfolio = game.getPlayerDetails(sessionId);
  const isMyTurn = sessionId === currentPlayerId;
  const currentPlayer = sessions.getPlayerName(currentPlayerId);

  const players = playersId.map((playerId: string) => {
    const isTheSamePlayer = sessionId === playerId;
    const name = sessions.getPlayerName(playerId);

    return { name, isTheSamePlayer };
  });

  return ctx.json({
    board,
    players,
    isMyTurn,
    mode,
    currentPlayer,
    playerPortfolio,
    isGameEnd,
    mergeData,
  });
};

export const handlePlaceTile = (ctx: Context) => {
  const tile = ctx.req.param("tile");
  const currentGame = ctx.get("currentGame");
  const game = currentGame.playTurn(tile);
  const placeInfo = game.placeTile(tile);

  return ctx.json(placeInfo);
};

export const setTile = (ctx: Context) => {
  const game = ctx.get("game");
  const tile = ctx.req.param("tile");
  game.setNextTile(tile);

  return ctx.text(tile);
};

export const handleFoundingHotel = (ctx: Context) => {
  const game = ctx.get("game");
  const tile = ctx.req.param("tile");
  const hotel = ctx.req.param("hotel");
  const status = game.foundHotel(tile, hotel);

  return ctx.json(status);
};

export const handleBuyStocks = async (ctx: Context) => {
  const game = ctx.get("game") as Game;
  const playerId: string = ctx.get("sessionId");
  const stocks = await ctx.req.json();
  const result = game.buyStocks(stocks, playerId);
  return ctx.json(result);
};

export const handleEndTurn = (ctx: Context) => {
  const game = ctx.get("game");
  console.log("this is the game", game);
  const response = game.changeTurn();
  const currentGame = ctx.get("currentGame");
  currentGame.playTurn();

  return ctx.json(response);
};

export const handleSellAndTradeStocks = async (ctx: Context) => {
  const game = ctx.get("game") as Game;
  const playerId: string = ctx.get("sessionId");
  const { tradeStats, stocks } = await ctx.req.json();

  const result = game.tradeAndSellStocks(tradeStats, stocks, playerId);

  return ctx.json(result);
};

export const handleMerge = (ctx: Context) => {
  const game = ctx.get("game") as Game;
  const acquirer = ctx.req.param("acquirer");
  const res = game.setupMergerEntities(acquirer as HotelName);
  return ctx.json(res);
};

export const storeScenario = (ctx: Context) => {
  const game = ctx.get("game");
  const filePath = ctx.req.param("scenario");
  const currentState = JSON.stringify(game.toJSON());

  Deno.writeTextFile(`src/data/testScenario/${filePath}.json`, currentState);

  return ctx.json(currentState);
};
