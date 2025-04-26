import _ from "lodash";
import { Board, buildingHotel, TileStatus } from "./board.ts";
import { HotelName, Player } from "./player.ts";
import { Hotel } from "./hotel.ts";
import { BuyStocks, Merger, TradeStats } from "./merger.ts";
import {
  BoardDetails,
  Game,
  GameStats,
  MergerData,
  PlaceTile,
  PlayerDetails,
  Tile,
} from "./game.ts";

export class StdGame implements Game {
  private board: Board;
  private pile: Tile[];
  private players: Player[];
  private currentPlayerIndex: number;

  constructor(tiles: Tile[], playerIds: string[], hotels: Hotel[]) {
    this.board = new Board(hotels);
    this.pile = [...tiles];
    this.players = this.initializePlayers(playerIds);
    this.currentPlayerIndex = 0;
  }

  playTurn(tile: Tile): Game {
    const placeInfo = this.board.getPlaceTileType(tile);

    if (placeInfo.type === TileStatus.Merge) {
      return new Merger(this);
    }
    return this;
  }

  private initializePlayers(playerIds: string[]) {
    return playerIds.map((player: string): Player => {
      const tiles = this.getTiles(6);
      return new Player(player, tiles);
    });
  }

  changeTurn(): { status: string } {
    this.assignTile();
    this.updateCurrentPlayerIndex();
    return { status: this.getCurrentPlayer() };
  }

  private assignTile(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const [tile] = this.getTiles(1);
    currentPlayer.addTile(tile);
  }

  private updateCurrentPlayerIndex(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  buyStocks(hotels: BuyStocks[], playerId: string): PlayerDetails | undefined {
    const currentPlayer = this.players.find((player) =>
      player.doesPlayerMatch(playerId)
    );

    for (const { hotel, count } of hotels) {
      const hotelInstance = this.board.getHotel(hotel);

      if (hotelInstance?.areStocksEnough(count) && currentPlayer) {
        const price = hotelInstance.calculatePrice(count);
        currentPlayer.deductCash(price);
        currentPlayer.addStock(count, hotel);
        hotelInstance.decrementStocks(count);
      }
    }

    return currentPlayer?.getPlayerDetails();
  }

  placeTile(tile: Tile): PlaceTile | { status: boolean } {
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (!currentPlayer.hasTile(tile)) return { status: false };

    const placeInfo = this.board.placeATile(tile);

    if (
      [TileStatus.Dependent, TileStatus.Independent].includes(placeInfo.type)
    ) {
      currentPlayer.removeTile(tile);
      return placeInfo;
    }

    return placeInfo;
  }

  foundHotel(tile: Tile, hotel: HotelName): buildingHotel {
    const foundHotel = this.board.buildHotel(tile, hotel);
    const currentPlayer = this.players[this.currentPlayerIndex];

    if (foundHotel.stockAllotted) currentPlayer.addStock(1, hotel);
    currentPlayer.removeTile(tile);

    return foundHotel;
  }

  getPlayerIds(): string[] {
    return this.players.map((player) => player.getPlayerDetails().playerId);
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  private getTiles(count: number): string[] {
    return this.pile.splice(0, count);
  }

  private getBoard(): BoardDetails {
    return this.board.getBoard();
  }

  getPlayerDetails(playerId: string): PlayerDetails | undefined {
    const playerInfo = this.players.find((player: Player) =>
      player.doesPlayerMatch(playerId)
    );

    return playerInfo?.getPlayerDetails();
  }

  private getCurrentPlayer(): string {
    return this.players[this.currentPlayerIndex].getPlayerDetails().playerId;
  }

  getAffectedHotels(tile: Tile): Hotel[] {
    return this.board.dependentHotels(tile);
  }

  getGameStats(): GameStats {
    const board = this.getBoard();
    const currentPlayerId = this.getCurrentPlayer();
    const playersId = this.getPlayerIds();

    return { board, playersId, currentPlayerId };
  }

  tradeAndSellStocks(
    _tradeStats: TradeStats,
    _stocks: BuyStocks[],
    _playerId: string,
  ) {
    return { error: "Not valid in Standard Game Mode" };
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.find((player) => player.doesPlayerMatch(playerId));
  }

  getHotel(hotelName: HotelName): Hotel | undefined {
    return this.board.hotels.find((hotel) => hotel.isAMatch(hotelName));
  }

  private getShareCount(
    player: Player,
    hotelName: HotelName,
  ): { player: Player; count: number } {
    return { player, count: player.countSharesOf(hotelName) };
  }

  private getPrimaryAndSecondaryHolders(hotelName: HotelName) {
    const playersStockCount = this.players.map((player) =>
      this.getShareCount(player, hotelName)
    );
    const groupedByStockCount = _.groupBy(
      playersStockCount,
      (value: { player: Player; count: number }) => value.count,
    );
    const sortedByStockCount = _.sortBy(Object.keys(groupedByStockCount));
    const highestStockCount = sortedByStockCount.at(-1);
    const secondHighestStockCount = sortedByStockCount.at(-2);

    const primaryHolders = groupedByStockCount[highestStockCount];
    const secondaryHolders = groupedByStockCount[secondHighestStockCount];

    return { primaryHolders, secondaryHolders };
  }

  private creditBonusToPlayers(playerIds: string[], bonus: number) {
    const avgBonus = bonus / playerIds.length;
    playerIds.forEach((playerId) => {
      const player = this.players.find((player) =>
        player.doesPlayerMatch(playerId)
      );
      player?.creditCash(avgBonus);
    });
  }

  private extractPlayerIds(
    players: { player: PlayerDetails; count: number }[],
  ) {
    return players?.map((playerInfo) => playerInfo.player.playerId);
  }

  distributeBonus(hotelName: HotelName) {
    const hotel = this.board.getHotel(hotelName);
    if (!hotel) return { status: "bonus is not distributed" };

    const primaryBonus = hotel?.getPrimaryBonus();
    const secondaryBonus = hotel?.getSecondaryBonus();
    const { primaryHolders, secondaryHolders } = this
      .getPrimaryAndSecondaryHolders(hotelName);

    const primaryPlayerIds = this.extractPlayerIds(primaryHolders);
    const secondaryPlayerIds = this.extractPlayerIds(secondaryHolders);

    if (primaryHolders.length > 1 || secondaryHolders[0].count === 0) {
      this.creditBonusToPlayers(
        primaryPlayerIds,
        primaryBonus + secondaryBonus,
      );
    } else {
      this.creditBonusToPlayers(primaryPlayerIds, primaryBonus);
      this.creditBonusToPlayers(secondaryPlayerIds, secondaryBonus);
    }

    return { status: "bonus distributed" };
  }

  getPlayersForTesting() {
    return this.players;
  }

  getBoardForTesting() {
    return this.board;
  }
  setupMergerEntities(_hotelName: HotelName): MergerData | { error: string } {
    return { error: "Not valid in Standard Game Mode" };
  }
}
