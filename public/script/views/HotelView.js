export default class HotelView {
  #name;
  #stocksAvailable;
  #stockPrice;
  constructor(name, stocksAvailable, stockPrice) {
    this.#name = name;
    this.#stocksAvailable = stocksAvailable;
    this.#stockPrice = stockPrice;
  }

  renderStocks() {
    const div = document.createElement("div");
    div.innerText =
      `${this.#name} : ${this.#stocksAvailable} ($${this.#stockPrice})`;

    return div;
  }

  static fromHotel(hotel) {
    return new HotelView(hotel.name, hotel.stocksAvailable, hotel.stockPrice);
  }
}
