import { Context, Hono, Next } from "hono";
import { serveStatic } from "hono/deno";
import { Acquire } from "./models/game.ts";
import {
  handleLogin,
  serveGameBoard,
  servePlayerDetails,
  servePlayers,
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
    .use("/login", ensureGuest)
    .get("/login", serveStatic({ path: "./public/login.html" }))
    .post(handleLogin);
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

  authenticatedRoutes.get("/*", serveStatic({ root: "./public" }));
  return authenticatedRoutes;
};

export const createApp = (acquire: Acquire, sessions: Set<string>) => {
  const guestRoutes = createGuestRoutes();
  const authenticatedRoutes = createAuthenticatedRoutes();
  const app = new Hono();

  app.use(setContext(acquire, sessions));
  app.get("/acquire/gameboard", serveGameBoard);
  app.get("/acquire/players", servePlayers);
  app.get("/acquire/player-details", servePlayerDetails);
  app.route("/", guestRoutes);
  app.route("/", authenticatedRoutes);

  return app;
};

// export const createApp = (acquire: Acquire, sessions: Set<string>) => {
//   const app = new Hono();

//   app.use(setContext(acquire, sessions));
//   app.use("*", authenticateUser);
//   app.post("/login", handleLogin);
//   app.get("/acquire/gameboard", serveGameBoard);
//   app.get("/acquire/players", servePlayers);
//   app.get("*", serveStatic({ root: "./public" }));
//   return app;
// };
