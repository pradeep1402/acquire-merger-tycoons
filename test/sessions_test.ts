import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { Sessions } from "../src/models/sessions.ts";

describe("Session model", () => {
  it("testing onePlayer", () => {
    const idGenerator = () => "1";
    const sessions = new Sessions(idGenerator);

    assertEquals(sessions.addPlayer("Sudheer"), { gameId: "1", playerId: "1" });
    assertEquals(sessions.getPlayerName("1"), "Sudheer");
  });

  it("testing getPlayerName", () => {
    let id = 0;
    const idGenerator = () => `${id++}`;
    const sessions = new Sessions(idGenerator);

    sessions.addPlayer("Sudheer");
    sessions.addPlayer("Pradeep");

    assertEquals(sessions.addPlayer("Likhi"), { gameId: "0", playerId: "3" });
    assertEquals(sessions.addPlayer("Pragna"), { playerId: "4", gameId: "5" });

    assertEquals(sessions.getPlayerName("4"), "Pragna");
  });
});
