import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { GameManager } from "./models/game_manager.ts";
import {
  handleBuyStocks,
  handleEndTurn,
  handleFoundingHotel,
  handleLogin,
  handlePlaceTile,
  handleQuickPlay,
  handleSellAndTradeStocks,
  serveGame,
  serveGameStatus,
  // handleMerge,
} from "./handlers/game_handler.ts";
import { deleteCookie, getCookie } from "hono/cookie";
import { Sessions } from "./models/sessions.ts";
import { Lobby } from "./models/lobby.ts";

const setContext =
  (sessions: Sessions, gameManager: GameManager, lobby: Lobby) =>
  async (ctx: Context, next: Next) => {
    ctx.set("sessions", sessions);
    ctx.set("gameManager", gameManager);
    ctx.set("lobby", lobby);
    await next();
  };

const ensureGuest = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, "sessionId");
  const sessions = c.get("sessions");
  if (sessionId && sessions.isSessionIdExist(sessionId)) {
    return c.redirect("/", 303);
  }

  return await next();
};

const createGuestRoutes = () => {
  const guestRoutes = new Hono();
  guestRoutes
    .use("/login.html", ensureGuest)
    .post("/login", handleLogin)
    .get("*", serveStatic({ root: "./public/general/" }));

  return guestRoutes;
};

const ensureAuthenticated = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, "sessionId");
  const sessions = c.get("sessions");

  if (!sessions.isSessionIdExist(sessionId)) {
    return c.redirect("/login.html", 303);
  }

  return await next();
};

const authenticatedContext = async (ctx: Context, next: Next) => {
  const { sessionId, gameId } = getCookie(ctx);
  const gameManager = ctx.get("gameManager") as GameManager;
  const sessions = ctx.get("sessions");
  const currentGame = gameManager.getCurrentGame(gameId);
  if (gameId && currentGame) {
    const game = currentGame.getGameState();
    ctx.set("game", game);
    ctx.set("currentGame", currentGame);
  }

  ctx.set("sessionId", sessionId);

  ctx.set("username", sessions.getPlayerName(sessionId));

  await next();
};

const ensureGameId = async (ctx: Context, next: Next) => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager = ctx.get("gameManager");

  if (gameId) {
    const game = gameManager.getGame(gameId);
    return game
      ? ctx.redirect("/game.html", 303)
      : ctx.redirect("/lobby.html", 303);
  }

  await next();
};

const ensureGamePage = async (ctx: Context, next: Next) => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager = ctx.get("gameManager");
  const gameStatus = gameManager.getGame(gameId);

  if (!gameId) return ctx.redirect("/", 303);
  if (gameId && !gameStatus) {
    return ctx.redirect("/lobby.html", 303);
  }

  await next();
};

const ensureLobbyPage = async (ctx: Context, next: Next) => {
  const gameId = getCookie(ctx, "gameId");
  const gameManager = ctx.get("gameManager");
  const gameStatus = gameManager.getGame(gameId);

  if (!gameId) return ctx.redirect("/", 303);
  if (gameId && gameStatus) {
    return ctx.redirect("/game.html", 303);
  }

  await next();
};

const createAuthenticatedRoutes = () => {
  const router = new Hono();
  router.use("/game.html", ensureGamePage);
  router.use("/lobby.html", ensureLobbyPage);
  router.use(ensureAuthenticated);
  router.use(authenticatedContext);
  router.use("/", ensureGameId);
  router.post("acquire/home/quick-play", handleQuickPlay);
  router.get("/acquire/game-status", serveGameStatus);
  router.patch("/acquire/buy-stocks", handleBuyStocks);
  router.patch("/acquire/merger/sell-trade-stocks", handleSellAndTradeStocks);
  router.patch("/acquire/end-turn", handleEndTurn);
  router.get("/acquire/game-stats", serveGame);
  router.patch("/acquire/place-tile/:tile", handlePlaceTile);
  router.patch("/acquire/place-tile/:tile/:hotel", handleFoundingHotel);
  // router.patch("/acquire/continue-merge/:acquirer", handleMerge);

  router.get("/*", serveStatic({ root: "./public" }));
  return router;
};

export const createApp = (
  sessions: Sessions,
  gameManager: GameManager,
  lobby: Lobby = new Lobby(),
) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();
  const app = new Hono();

  app.use(logger());
  app.use(setContext(sessions, gameManager, lobby));
  app.get("/logout", (ctx: Context) => {
    deleteCookie(ctx, "sessionId");
    deleteCookie(ctx, "gameId");
    return ctx.redirect("/login.html", 303);
  });

  app.route("/", guestRoutes);
  app.route("/", authenticatedRoutes);

  return app;
};
