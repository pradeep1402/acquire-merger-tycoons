import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Sessions } from "../src/models/sessions.ts";
import { GameManager } from "../src/models/game_manager.ts";

describe("Session model", () => {
  it("testing onePlayer", () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);

    assertEquals(sessions.addPlayer("Sudheer"), "1");
    assertEquals(sessions.getPlayerName("1"), "Sudheer");
  });

  it("testing getPlayerName", () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const sessions = new Sessions(idGenerator);

    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Pradeep");

    assertEquals(sessions.addPlayer("Likhi"), "3");
    assertEquals(sessions.addPlayer("Pragna"), "4");

    assertEquals(sessions.getPlayerName("4"), "Pragna");
  });

  it("testing addToWaitingList", () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const sessions = new Sessions(idGenerator);

    const tiles = ["1A", "2A"];
    const gameManager = new GameManager(tiles, []);
    sessions.addPlayer("Sudheer");
    assertEquals(sessions.addToWaitingList("1", gameManager), {
      playerId: "1",
      gameId: "0",
    });
  });

  it("testing addToWaitingList for more than 3 players join", () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const sessions = new Sessions(idGenerator);

    const tiles = ["1A", "2A"];
    const gameManager = new GameManager(tiles, []);
    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Pradeep");
    sessions.addPlayer("Likhi");
    sessions.addPlayer("Pragna");

    assertEquals(sessions.addToWaitingList("1", gameManager), {
      playerId: "1",
      gameId: "0",
    });
    assertEquals(sessions.addToWaitingList("2", gameManager), {
      playerId: "2",
      gameId: "0",
    });
    assertEquals(sessions.addToWaitingList("3", gameManager), {
      playerId: "3",
      gameId: "0",
    });
    assertEquals(sessions.addToWaitingList("4", gameManager), {
      playerId: "4",
      gameId: "5",
    });
  });

  describe("testing removeSession", () => {
    it("should return waiting when only one player joined", () => {
      let id = 0;
      const idGenerator = () => `${id++}`;
      const sessions = new Sessions(idGenerator);

      sessions.addPlayer("Sudheer");

      assertEquals(sessions.removeSession("1"), "Removed Successfully");
      assertEquals(sessions.getPlayerName("1"), null);
    });
  });
});
