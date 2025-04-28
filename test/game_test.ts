import { assertEquals } from "assert";
import { beforeEach, describe, it } from "testing/bdd";
import { stub } from "testing/mock";
import { BuyStocks, Merger, MergeType } from "../src/models/merger.ts";
import { StdGame } from "../src/models/stdGame.ts";
import { BoardDetails, GameStats } from "../src/models/game.ts";
import { Board, TileStatus } from "../src/models/board.ts";
import { Hotel } from "../src/models/hotel.ts";
import { Player } from "../src/models/player.ts";

let imperial: Hotel, continental: Hotel;
const createPlayers = (idTexts: string): Player[] =>
  idTexts.split(" ").map((id: string) => new Player(id));

beforeEach(() => {
  imperial = new Hotel("Imperial", 2);
  continental = new Hotel("Continental", 2);
});

describe("Game model", () => {
  describe("getPlayerIds(", () => {
    it("should return all the players ids", () => {
      const game = new StdGame(
        ["1A", "2A", "3A", "4A", "5A", "6A"],
        createPlayers("12 13 14"),
        [],
      );

      assertEquals(game.getPlayerIds(), ["12", "13", "14"]);
    });
  });
});

describe("getPlayer(", () => {
  it("should return  the player with id", () => {
    const game = new StdGame([], createPlayers("12 13 14"), []);

    assertEquals(game.getPlayer("12"), new Player("12"));
  });
});

describe("tradeAndSellStocks()", () => {
  it("should return error with message when accessing tradeAndSellStocks", () => {
    const game = new StdGame([], [], []);

    const { error } = game.tradeAndSellStocks(
      { acquirer: "American", target: "Continental", count: 3 },
      [],
      "",
    );
    assertEquals(error, "Not valid in Standard Game Mode");
  });
});
describe("setupMergerEntities()", () => {
  it("should return error with message when accessing setupMergerEntities", () => {
    const game = new StdGame([], [], []);

    const error = game.setupMergerEntities("Continental");
    assertEquals(error, { error: "Not valid in Standard Game Mode" });
  });
});

describe("getPlayerDetails(playerId) method", () => {
  it("should return a specific player info", () => {
    const tiles = ["1A"];
    const game = new StdGame([...tiles], createPlayers("123"), []);
    const actual = game.getPlayerDetails("123");

    assertEquals(actual?.playerId, "123");
    assertEquals(actual?.cash, 6000);

    assertEquals(actual?.tiles, tiles);
  });
});

describe("placeTile() method", () => {
  it("should return false for wrong tile", () => {
    const game = new StdGame(["1A", "2A"], createPlayers("Adi Malli Aman"), []);

    assertEquals(game.placeTile("3A"), { status: false });
  });

  it("should return the tile info of placed tile", () => {
    const game = new StdGame(["1A", "2A"], createPlayers("Adi Malli Aman"), []);

    assertEquals(game.placeTile("1A"), {
      tile: "1A",
      type: TileStatus.Independent,
    });
  });

  it("should return the tile info when tile type is build", () => {
    const game = new StdGame(["1A", "2A"], createPlayers("Adi"), [imperial]);
    game.placeTile("2A");

    assertEquals(game.placeTile("1A"), {
      inActiveHotels: [
        {
          name: "Imperial",
          tiles: [],
          stocksAvailable: 25,
          stockPrice: 0,
          baseTile: "",
        },
      ],
      tile: "1A",
      type: TileStatus.Build,
    });
  });
});

describe("foundHotel() method", () => {
  it("should return false for wrong tile", () => {
    const game = new StdGame(["1A", "2A"], createPlayers("Adi Malli Aman"), [
      imperial,
    ]);

    assertEquals(game.foundHotel("3A", "Imperial"), {
      hotel: {
        name: "Imperial",
        tiles: [],
        stocksAvailable: 24,
        stockPrice: 0,
        baseTile: "3A",
      },
      stockAllotted: true,
    });
  });
});

describe("buyStocks() method", () => {
  it("should return updated player details when buying only one kind of stocks", () => {
    const game = new StdGame(
      ["1A", "2A", "5A"],
      createPlayers("Adi Malli Aman"),
      [imperial],
    );
    game.placeTile("1A");
    game.changeTurn();

    game.foundHotel("2A", "Imperial");
    const stocks: BuyStocks[] = [{ hotel: "Imperial", count: 3 }];
    const result = game.buyStocks(stocks, "Malli");

    assertEquals(result, {
      cash: 4800,
      playerId: "Malli",
      tiles: [],
      stocks: {
        Sackson: 0,
        Tower: 0,
        Festival: 0,
        Worldwide: 0,
        American: 0,
        Continental: 0,
        Imperial: 4,
      },
    });
  });

  it("should return updated player details when buying multiple kind of stocks", () => {
    const game = new StdGame(
      [
        "1A",
        "2A",
        "5A",
        "6A",
        "7A",
        "8A",
        "9A",
        "10A",
        "11A",
        "12A",
        "1B",
        "2B",
        "3B",
        "4B",
        "5B",
        "6B",
        "7B",
        "9B",
        "10B",
        "11B",
      ],
      createPlayers("Adi Malli Aman"),
      [imperial, continental],
    );
    game.placeTile("8A");
    game.changeTurn();
    game.foundHotel("7A", "Imperial");
    game.changeTurn();
    game.placeTile("9B");
    game.changeTurn();
    game.foundHotel("10B", "Continental");
    game.changeTurn();
    const stocks: BuyStocks[] = [
      { hotel: "Imperial", count: 1 },
      { hotel: "Continental", count: 2 },
    ];
    const result = game.buyStocks(stocks, "Malli");
    const mergeGame = game.playTurn("9A") as Merger;
    assertEquals(mergeGame.placeTile("9A"), {
      tile: "9A",
      type: TileStatus.Merge,
      mergeDetails: {
        typeofMerge: MergeType.SelectiveMerge,
        hotels: [
          { name: "Imperial", size: 2, baseTile: "7A" },
          { name: "Continental", size: 2, baseTile: "10B" },
        ],
      },
    });

    assertEquals(mergeGame.getState(), game);
    assertEquals(game.placeTile("9A"), {
      tile: "9A",
      type: TileStatus.Merge,
    });

    assertEquals(result, {
      playerId: "Malli",
      cash: 4800,
      tiles: ["9A", "10A", "11A", "12A", "1B", "2B", "11B"],
      stocks: {
        Sackson: 0,
        Tower: 0,
        Festival: 0,
        Worldwide: 0,
        American: 0,
        Continental: 2,
        Imperial: 2,
      },
    });
  });
});

describe("Testing mergers", () => {
  it("testing merger class when there two hotel merging of same size", () => {
    const game = new StdGame(
      [
        "1A",
        "2A",
        "5A",
        "6A",
        "7A",
        "8A",
        "9A",
        "10A",
        "11A",
        "12A",
        "1B",
        "2B",
        "3B",
        "4B",
        "5B",
        "6B",
        "7B",
        "9B",
        "10B",
        "11B",
      ],
      createPlayers("Adi Malli Aman"),
      [imperial, continental],
    );
    game.placeTile("8A");
    game.changeTurn();
    game.foundHotel("7A", "Imperial");
    game.changeTurn();
    game.placeTile("9B");
    game.changeTurn();
    game.foundHotel("10B", "Continental");
    game.changeTurn();
    const stocks: BuyStocks[] = [
      { hotel: "Imperial", count: 1 },
      { hotel: "Continental", count: 2 },
    ];
    const result = game.buyStocks(stocks, "Malli");
    const mergeGame = game.playTurn("9A") as Merger;
    assertEquals(mergeGame.placeTile("9A"), {
      tile: "9A",
      type: TileStatus.Merge,
      mergeDetails: {
        typeofMerge: MergeType.SelectiveMerge,
        hotels: [
          { name: "Imperial", size: 2, baseTile: "7A" },
          { name: "Continental", size: 2, baseTile: "10B" },
        ],
      },
    });

    assertEquals(mergeGame.getState(), game);
    assertEquals(game.placeTile("9A"), {
      tile: "9A",
      type: TileStatus.Merge,
    });

    assertEquals(result, {
      playerId: "Malli",
      cash: 4800,
      tiles: ["9A", "10A", "11A", "12A", "1B", "2B", "11B"],
      stocks: {
        Sackson: 0,
        Tower: 0,
        Festival: 0,
        Worldwide: 0,
        American: 0,
        Continental: 2,
        Imperial: 2,
      },
    });
  });

  it("testing merger class when there are two hotel merging of different size", () => {
    const game = new StdGame(
      [
        "6A",
        "7A",
        "8A",
        "9A",
        "9B",
        "10B",
        "11B",
        "10A",
        "6B",
        "7B",
        "12B",
        "1C",
      ],
      createPlayers("Adi Malli Aman"),
      [imperial, continental],
    );
    game.placeTile("8A");

    game.foundHotel("7A", "Imperial");

    game.placeTile("6A");

    game.placeTile("9B");

    game.foundHotel("10B", "Continental");

    const mergeGame = game.playTurn("8B") as Merger;

    assertEquals(mergeGame.placeTile("8B"), {
      tile: "8B",
      type: TileStatus.Merge,
      mergeDetails: {
        target: [
          {
            name: "Continental",
            size: 2,
            baseTile: "10B",
          },
        ],
        acquirer: {
          name: "Imperial",
          size: 3,
          baseTile: "7A",
        },
        typeofMerge: MergeType.AutoMerge,
      },
    });

    assertEquals(mergeGame.getState(), game);
    assertEquals(game.placeTile("9A"), {
      tile: "9A",
      type: TileStatus.Merge,
    });
  });
});

describe("getGameStats() method", () => {
  const csv = (text: string, separator = " ") => text.split(separator);
  it("should return game stats", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const game = new StdGame(tiles, createPlayers("Adi Malli"), [
      imperial,
    ]);

    const board: BoardDetails = {
      independentTiles: [],
      activeHotels: [],
      inActiveHotels: [
        {
          baseTile: "",
          name: "Imperial",
          stockPrice: 0,
          stocksAvailable: 25,
          tiles: [],
        },
      ],
      mergerTile: null,
    };
    const playersId = ["Adi", "Malli"];
    const currentPlayerId = "Adi";
    const isGameEnd = false;
    const gameStats: GameStats = {
      board,
      playersId,
      currentPlayerId,
      isGameEnd,
    };
    assertEquals(game.getGameStats(), gameStats);
  });
});

describe("distributeBonus() method", () => {
  const csv = (text: string, separator = " ") => text.split(separator);
  it("should distribute bonus in the order of number of stocks from primary to secondary", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);

    const players: Player[] = game.getPlayersForTesting();

    const player1 = players.find((player) => player.doesPlayerMatch("1"));
    const player2 = players.find((player) => player.doesPlayerMatch("2"));

    player1?.addStock(5, "Imperial");
    player2?.addStock(3, "Imperial");

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus distributed");
    assertEquals(game.getPlayerDetails("1")?.cash, 8000);
    assertEquals(game.getPlayerDetails("2")?.cash, 7000);
  });

  it("should distribute average of both bonuses for the players having highest equal no.of stocks", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);

    const players: Player[] = game.getPlayersForTesting();

    const player1 = players.find((player) => player.doesPlayerMatch("1"));
    const player2 = players.find((player) => player.doesPlayerMatch("2"));
    const player3 = players.find((player) => player.doesPlayerMatch("3"));

    player1?.addStock(5, "Imperial");
    player2?.addStock(5, "Imperial");
    player3?.addStock(3, "Imperial");

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus distributed");
    assertEquals(game.getPlayerDetails("1")?.cash, 7500);
    assertEquals(game.getPlayerDetails("2")?.cash, 7500);
    assertEquals(game.getPlayerDetails("3")?.cash, 6000);
  });

  it("should distribute average of both bonuses for the players having highest equal no.of stocks", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);

    const players: Player[] = game.getPlayersForTesting();

    const player1 = players.find((player) => player.doesPlayerMatch("1"));
    const player2 = players.find((player) => player.doesPlayerMatch("2"));
    const player3 = players.find((player) => player.doesPlayerMatch("3"));

    player1?.addStock(5, "Imperial");
    player2?.addStock(5, "Imperial");
    player3?.addStock(5, "Imperial");

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus distributed");
    assertEquals(game.getPlayerDetails("1")?.cash, 7000);
    assertEquals(game.getPlayerDetails("2")?.cash, 7000);
    assertEquals(game.getPlayerDetails("3")?.cash, 7000);
  });

  it("should distribute primary to highestStockHolder and average of secondary bonus for the players having second highest equal no.of stocks", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);

    const players: Player[] = game.getPlayersForTesting();

    const player1 = players.find((player) => player.doesPlayerMatch("1"));
    const player2 = players.find((player) => player.doesPlayerMatch("2"));
    const player3 = players.find((player) => player.doesPlayerMatch("3"));

    player1?.addStock(5, "Imperial");
    player2?.addStock(3, "Imperial");
    player3?.addStock(3, "Imperial");

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus distributed");
    assertEquals(game.getPlayerDetails("1")?.cash, 8000);
    assertEquals(game.getPlayerDetails("2")?.cash, 6500);
    assertEquals(game.getPlayerDetails("3")?.cash, 6500);
  });

  it("should distribute both bonuses for the players having highest no.of stocks and if second highest stock count is 0", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );

    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);

    const players: Player[] = game.getPlayersForTesting();

    const player1 = players.find((player) => player.doesPlayerMatch("1"));
    const player2 = players.find((player) => player.doesPlayerMatch("2"));
    const player3 = players.find((player) => player.doesPlayerMatch("3"));

    player1?.addStock(1, "Imperial");
    player2?.addStock(0, "Imperial");
    player3?.addStock(0, "Imperial");

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus distributed");
    assertEquals(game.getPlayerDetails("1")?.cash, 9000);
    assertEquals(game.getPlayerDetails("2")?.cash, 6000);
    assertEquals(game.getPlayerDetails("3")?.cash, 6000);
  });

  it("should not distribute bonuses if hotel is not merging", () => {
    const tiles = csv(
      "6A 7A 8A 9A 9B 10B 11B 10A 6B 7B 12B 1I 10I 11H 10H 6H 7H 12H 1H",
    );
    const hotels = [imperial, continental];
    const game = new StdGame(tiles, createPlayers("1 2 3"), hotels);
    const board: Board = game.getBoardForTesting();

    assertEquals(game.getPlayerDetails("1")?.cash, 6000);

    stub(imperial, "getPrimaryBonus", () => 2000);
    stub(imperial, "getSecondaryBonus", () => 1000);
    stub(board, "getHotel", () => undefined);

    const result = game.distributeBonus("Imperial");

    assertEquals(result.status, "bonus is not distributed");
  });
});
