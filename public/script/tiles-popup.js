const setup = () => {
  const tileData = ["1A", "2B", "3C", "4D", "5E", "6F"];
  const tiles = document.querySelectorAll(".tile");
  console.log(tileData, tiles);

  tiles.forEach((tile, index) => (tile.textContent = tileData[index]));
};

const main = () => {
  const popup = document.getElementById("tiles-popup");
  setup();
};

globalThis.onload = main;
