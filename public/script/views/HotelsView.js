import HotelView from "./HotelView.js";

export default class HotelsView {
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
