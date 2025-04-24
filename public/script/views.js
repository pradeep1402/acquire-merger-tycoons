import { cloneTemplates } from "./game.js";

class TileView {
  #label;
  constructor(label) {
    this.#label = label;
  }

  render() {
    const playerTile = cloneTemplates("assigned-tile").querySelector(
      ".player-tile",
    );
    playerTile.textContent = this.#label;

    return playerTile;
  }
}

class CashView {
  #cash;
  constructor(cash) {
    this.#cash = cash;
  }

  render() {
    const cashInfo = document.querySelector("#money-available");

    cashInfo.textContent = `$${this.#cash}`;
  }
}

export class PortfolioView {
  #tiles;
  #stocks;
  #cash;

  constructor(tiles, stocks, cash) {
    this.#tiles = tiles.map((tile) => new TileView(tile));
    this.#stocks = Object.entries(stocks);
    this.#cash = new CashView(cash);
  }

  #renderStocks([name, count]) {
    const hotelStocks = cloneTemplates("stocks-template")
      .querySelector(".hotel-stocks");
    const [img, hotelName, stockCount] = hotelStocks.children;

    img.src = `/images/hotels/${name.toLowerCase()}.png`;
    hotelName.textContent = name;
    stockCount.textContent = count;

    return hotelStocks;
  }

  renderPortfolio() {
    const tilesContainer = document.querySelector("#portfolio-tiles");
    tilesContainer.replaceChildren(...this.#tiles.map((tile) => tile.render()));

    const stocksContainer = document.querySelector("#stock-info");
    stocksContainer.replaceChildren(...this.#stocks.map(this.#renderStocks));

    this.#cash.render();
  }
}

class HotelView {
  #name;
  #stocksAvailable;
  #stockPrice;
  constructor(name, stocksAvailable, stockPrice) {
    this.#name = name;
    this.#stocksAvailable = stocksAvailable;
    this.#stockPrice = stockPrice;
  }

  renderStocks() {
    const hotelStocks = cloneTemplates("stocks-template")
      .querySelector(".hotel-stocks");
    const [img, hotelName, stockCount, price] = hotelStocks.children;

    img.src = `/images/hotels/${this.#name.toLowerCase()}.png`;
    hotelName.textContent = this.#name;
    stockCount.textContent = this.#stocksAvailable;
    price.textContent = this.#stockPrice;
    hotelStocks.classList.add("available-stocks");

    return hotelStocks;
  }

  static fromHotel(hotel) {
    return new HotelView(hotel.name, hotel.stocksAvailable, hotel.stockPrice);
  }
}

export class HotelsView {
  #activeHotels;
  #inactiveHotels;
  constructor(activeHotels, inActiveHotels) {
    this.#activeHotels = activeHotels;
    this.#inactiveHotels = inActiveHotels;
  }

  renderStocks() {
    const stocksSection = document.querySelector("#stocks-section");
    const hotelElements = this.#activeHotels.concat(this.#inactiveHotels)
      .map((hotel) => HotelView.fromHotel(hotel))
      .map((hotelView) => hotelView.renderStocks());

    stocksSection.replaceChildren(...hotelElements);
  }
}

export class PlayersView {
  #players;
  #currentPlayer;
  constructor(players, currentPlayer) {
    this.#players = players;
    this.#currentPlayer = currentPlayer;
  }

  #createPlayerAvatar({ name, isTheSamePlayer }) {
    const playerTemplate = cloneTemplates("players-template");
    const player = playerTemplate.querySelector("#player");
    const avatar = player.querySelector(".player-avatar");

    player.querySelector(".player-name").textContent = isTheSamePlayer
      ? `${name} (YOU)`
      : name;
    this.#currentPlayer === name && avatar.classList.add("active-player");
    return player;
  }

  renderPlayers() {
    const playerSection = document.getElementById("players");
    const playersEle = this.#players.map(this.#createPlayerAvatar.bind(this));

    playerSection.replaceChildren(...playersEle);
  }
}
