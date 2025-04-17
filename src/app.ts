import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { Acquire } from "./models/game.ts";
import {
  handleLogin,
  serveGameBoard,
  servePlayerDetails,
  servePlayers,
  // serveGameStatus,
} from "./handlers/game_handler.ts";

import { getCookie } from "hono/cookie";

const setContext =
  (acquire: Acquire, sessions: Set<string>) =>
  async (context: Context, next: Next) => {
    context.set("sessions", sessions);
    context.set("acquire", acquire);
    await next();
  };

// const authenticateUser = async (ctx: Context, next: Next) => {
//   const session = getCookie(ctx, "sessionId");
//   const url = new URL(ctx.req.url);

//   if (!session) {
//     return ctx.redirect("/pages/login.html", 303);
//   }

//   await next();
// };

const ensureGuest = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, "sessionId");
  const sessions = c.get("sessions");

  if (sessionId && sessions.has(sessionId)) {
    return c.redirect("/", 303);
  }

  return await next();
};

const createGuestRoutes = () => {
  const guestRoutes = new Hono();
  guestRoutes
    .use("/login.html", ensureGuest)
    .post("/login", handleLogin)
    .get("/login.html", serveStatic({ path: "./public/login.html" }))
    .get(
      "/style/login.css",
      serveStatic({
        path: "./public/style/login.css",
      })
    );
  return guestRoutes;
};

const ensureAuthenticated = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, "sessionId");
  const sessions = c.get("sessions");

  if (!sessions.has(sessionId)) {
    return c.redirect("/login.html", 303);
  }
  return await next();
};

const createAuthenticatedRoutes = () => {
  const authenticatedRoutes = new Hono();

  authenticatedRoutes.use(ensureAuthenticated);
  authenticatedRoutes.get("/acquire/gameboard", serveGameBoard);
  authenticatedRoutes.get("/acquire/players", servePlayers);
  authenticatedRoutes.get("/acquire/player-details", servePlayerDetails);
  // authenticatedRoutes.get("/gameStatus", serveGameStatus);

  authenticatedRoutes.get("/*", serveStatic({ root: "./public" }));
  return authenticatedRoutes;
};

export const createApp = (acquire: Acquire, sessions: Set<string>) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();
  const app = new Hono();

  app.use(logger());
  app.use(setContext(acquire, sessions));

  app.route("/", guestRoutes);
  app.route("/", authenticatedRoutes);

  return app;
};
