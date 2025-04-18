import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { GameManager } from "./models/game_manager.ts";
import {
  handleLogin,
  handleQuickPlay,
  serveGameBoard,
  servePlayerDetails,
  servePlayers,
  serveGameStatus,
} from "./handlers/game_handler.ts";
import { getCookie } from "hono/cookie";
import { Sessions } from "./models/sessions.ts";

const setContext =
  (sessions: Sessions, gameManager: GameManager) =>
  async (ctx: Context, next: Next) => {
    ctx.set("sessions", sessions);
    ctx.set("gameManager", gameManager);
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
  const gameManager = ctx.get("gameManager");
  const sessions = ctx.get("sessions");

  ctx.set("sessionId", sessionId);
  ctx.set("game", gameManager.getGame(gameId));
  ctx.set("username", sessions.getPlayerName(sessionId));

  await next();
};

const createAuthenticatedRoutes = () => {
  const authenticatedRoutes = new Hono();

  authenticatedRoutes.use(ensureAuthenticated);
  authenticatedRoutes.use(authenticatedContext);
  authenticatedRoutes.post("acquire/home/quick-play", handleQuickPlay);
  authenticatedRoutes.get("/acquire/gameboard", serveGameBoard);
  authenticatedRoutes.get("/acquire/players", servePlayers);
  authenticatedRoutes.get("/acquire/player-details", servePlayerDetails);
  authenticatedRoutes.get("/acquire/gameStatus", serveGameStatus);

  authenticatedRoutes.get("/*", serveStatic({ root: "./public" }));
  return authenticatedRoutes;
};

export const createApp = (sessions: Sessions, gameManager: GameManager) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();
  const app = new Hono();

  app.use(logger());
  app.use(setContext(sessions, gameManager));

  app.route("/", guestRoutes);
  app.route("/", authenticatedRoutes);

  return app;
};
