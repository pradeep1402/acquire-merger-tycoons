import _ from "lodash";
import { HotelName, Player } from "./player.ts";
import { Board, TileStatus } from "./board.ts";
import {
  BoardDetails,
  BonusDistribution,
  Game,
  GameStats,
  MergerData,
  PlaceTile,
  PlayerDetails,
  Tile,
} from "./game.ts";
import { Hotel } from "./hotel.ts";

export type HotelDetails = {
  name: string;
  size: number;
  baseTile: string;
};

export type TradeStats = {
  acquirer: HotelName;
  target: HotelName;
  count: number;
};

export type BuyStocks = {
  hotel: HotelName;
  count: number;
};

export type MergerType =
  | {
    typeofMerge: MergeType;
    hotels: {
      name: string;
      size: number;
      baseTile: Tile;
    }[];
  }
  | {
    typeofMerge: MergeType;
    acquirer?: HotelDetails;
    targets: HotelDetails[];
    hotels?: undefined;
  };

export enum MergeType {
  AutoMerge = "AutoMerge",
  SelectiveMerge = "SelectiveMerge",
}

export class Merger implements Game {
  private original;
  private acquirer: HotelName | null;
  private targets: HotelName[];
  private hotelsAffected: HotelDetails[];
  private currentPlayerIndex;
  private playersIds;
  private countOfTurns;
  private mode: string | null;
  private turnsIndex: number;
  private mergerTile: null | string;

  constructor(game: Game) {
    this.original = game;
    this.currentPlayerIndex = this.getCurrentPlayerIndex();
    this.countOfTurns = 0;
    this.playersIds = this.getPlayerIds();
    this.acquirer = null;
    this.targets = [];
    this.hotelsAffected = [];
    this.mode = null;
    this.turnsIndex = 0;
    this.mergerTile = null;
  }

  playTurn(tile: Tile = "default"): Game {
    if (tile === "default" && this.countOfTurns <= this.turnsIndex) {
      this.targets.forEach((targetHotel) => {
        this.mergeTarget(targetHotel);
      });
      return this.original;
    }

    return this;
  }

  private mergeTarget(target: HotelName) {
    const targetInstance = this.getHotel(target);
    const acquirerInstance = this.getHotel(this.acquirer as HotelName);
    targetInstance?.toggleStatus();
    const tiles = targetInstance?.getAllTiles();
    targetInstance?.removeBaseTile();
    const mergerTiles = this.getBoardInstance().getAdjacentTilesOf(
      this.mergerTile as string,
    );
    tiles?.push(this.mergerTile as string, ...mergerTiles);
    tiles?.forEach((tile) => acquirerInstance?.addTile(tile));
  }

  getBoardInstance(): Board {
    return this.original.getBoardInstance();
  }

  placeTile(tile: Tile): PlaceTile {
    this.mergerTile = tile;
    this.getPlayer(this.getCurrentPlayer())?.removeTile(tile);

    const game = this.original;
    const hotelsInMerge = game.getAffectedHotels(tile);

    const mergeDetails = this.getMergeTypeAndDetails(hotelsInMerge);
    return { tile, type: TileStatus.Merge, mergeDetails };
  }

  private isTwoHotelOfSameSize(hotels: HotelDetails[]): boolean {
    const sizeGroups = _.groupBy(hotels, "size");

    return Object.values(sizeGroups).some(
      (group) => (group as HotelDetails[]).length >= 2,
    );
  }

  private getHotelInfo(hotelsInMerge: Hotel[]) {
    this.hotelsAffected = hotelsInMerge.map((hotel) => ({
      name: hotel.getHotelName(),
      size: hotel.getSize(),
      baseTile: hotel.getBaseTile(),
    }));

    return this.hotelsAffected;
  }

  private sortHotelsBySize(hotels: HotelDetails[]): HotelDetails[] {
    return _.orderBy(hotels, ["size"], ["desc"]);
  }

  private areAllHotelsOfSameSize(hotels: HotelDetails[]): boolean {
    const firstHotelSize = hotels[0].size;
    return hotels.every((hotel) => hotel.size === firstHotelSize);
  }

  private getMergeTypeAndDetails(hotelsName: Hotel[]) {
    const hotels = this.getHotelInfo(hotelsName);

    if (this.areAllHotelsOfSameSize(hotels)) {
      return { typeofMerge: MergeType.SelectiveMerge, hotels };
    }

    const sortedHotels = this.sortHotelsBySize(hotels);
    const [acquirer, ...targets] = sortedHotels;

    this.acquirer = acquirer.name as HotelName;
    this.targets = targets.map((hotel) => hotel.name as HotelName);

    const typeofMerge = this.isTwoHotelOfSameSize(hotels)
      ? MergeType.SelectiveMerge
      : MergeType.AutoMerge;

    return { typeofMerge, acquirer, targets };
  }

  buyStocks(_hotels: BuyStocks[], _playerId: string) {
    return { error: "Not valid in Merger Mode" };
  }

  foundHotel(_tile: Tile, _hotel: HotelName) {
    return { error: "Not valid in Merger Mode" };
  }

  getPlayerIds() {
    return this.original.getPlayerIds();
  }

  getCurrentPlayerIndex(): number {
    return this.original.getCurrentPlayerIndex();
  }

  getPlayerDetails(playerId: string) {
    return this.original.getPlayerDetails(playerId);
  }

  getBoard(): BoardDetails {
    return this.original.getBoard();
  }

  getGameStats(playerId: string): GameStats {
    const board = this.getBoard();
    const currentPlayerId = this.getCurrentPlayer();
    const playersId = this.getPlayerIds();
    const playerPortfolio = this.getPlayerDetails(playerId);

    return {
      board,
      playersId,
      currentPlayerId,
      mergeData: {
        mode: this.mode,
        acquirer: this.acquirer,
        target: this.targets[0] || null,
      },
      playerPortfolio,
    };
  }

  getAffectedHotels(tile: Tile) {
    return this.original.getAffectedHotels(tile);
  }

  private sellStocks(player: Player, stocks: BuyStocks[]) {
    for (const { hotel, count } of stocks) {
      const hotelInstance = this.getHotel(hotel);
      const priceGained = hotelInstance?.calculatePrice(count) as number;

      player.creditCash(priceGained);
      player.deductStock(count, hotel);
      hotelInstance?.incrementStocks(count);
    }

    return player.getPlayerDetails();
  }

  private tradeStocks(player: Player, { acquirer, target, count }: TradeStats) {
    const acquirerHotel = this.getHotel(acquirer);
    acquirerHotel?.decrementStocks(Math.floor(count / 2));
    player.addStock(Math.floor(count / 2), acquirer);
    const targetHotel = this.getHotel(target);
    targetHotel?.incrementStocks(count);
    player.deductStock(count, target);

    return player.getPlayerDetails();
  }

  tradeAndSellStocks(
    tradeStats: TradeStats,
    stocks: BuyStocks[],
    playerId: string,
  ): PlayerDetails | undefined {
    const player = this.getPlayer(playerId) as Player;
    this.sellStocks(player, stocks);
    this.tradeStocks(player, tradeStats);

    return this.getPlayerDetails(playerId);
  }

  private getCurrentPlayer(): string {
    return this.playersIds[this.currentPlayerIndex];
  }

  doesPlayerHasStocks() {
    const player = this.getPlayer(this.getCurrentPlayer());

    return player?.hasStocksOf(this.targets[0]);
  }

  private updatePlayerIndex() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.playersIds.length;
    this.turnsIndex += 1;
  }

  isMergerRoundOver() {
    return this.countOfTurns >= this.turnsIndex;
  }

  changeTurn() {
    this.updatePlayerIndex();

    if (!this.doesPlayerHasStocks() && this.isMergerRoundOver()) {
      this.changeTurn();
    }

    return { status: this.getCurrentPlayer() };
  }

  getPlayer(playerId: string) {
    return this.original.getPlayer(playerId);
  }

  getHotel(hotelName: HotelName) {
    return this.original.getHotel(hotelName);
  }

  private initiateProcess() {
    this.countOfTurns = this.targets.length * 3;
    // Distribute bonus for the first target hotel to be merged
    if (this.targets.length > 0) {
      this.distributeBonus(this.targets[0]);
    }
    if (!this.doesPlayerHasStocks() && this.isMergerRoundOver()) {
      this.changeTurn();
    }
  }

  setupMergerEntities(acquirer: HotelName): MergerData {
    this.acquirer = acquirer;
    this.targets = this.hotelsAffected
      .filter(({ name }) => name !== acquirer)
      .map(({ name }) => name as HotelName);
    this.mode = "Merge";
    this.initiateProcess();

    return { acquirer: this.acquirer, target: this.targets };
  }

  distributeBonus(hotelName: HotelName): undefined | BonusDistribution {
    return this.original.distributeBonus(hotelName);
  }

  isGameEnd() {
    return this.original.isGameEnd();
  }

  distributeEndGameBonus() {
    return this.original.distributeEndGameBonus();
  }

  winner() {
    return this.original.winner();
  }
}
