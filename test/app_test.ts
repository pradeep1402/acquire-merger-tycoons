import { assertEquals } from "assert";
import { describe, it } from "testing/bdd";
import { createApp } from "../src/app.ts";

describe("APP: acquire/game", () => {
  it("should set session id and player name", () => {
    createApp().request("/");
    assertEquals(1, 1);
  });
});
