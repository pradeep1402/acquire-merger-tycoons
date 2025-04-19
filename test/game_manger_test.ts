import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { GameManager } from "../src/models/game_manager.ts";
import { Game } from "../src/models/game.ts";

describe("GameManager", () => {
  it("should return a new game instance when players are provided", () => {
    const gm = new GameManager(["a", "b"]);
    const game = gm.createGame("12", ["sudheer"]);
    assertEquals(new Game(["a", "b"], ["sudheer"]), game);
  });

  it("should return the specific game instance when gameId is provided", () => {
    const gm = new GameManager(["a", "b"]);
    const game = gm.createGame("12", ["sudheer"]);
    assertEquals(gm.getGame("12"), game);
  });
});
