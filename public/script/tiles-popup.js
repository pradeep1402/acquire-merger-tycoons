const setup = () => {
  const tileData = ["1A", "2B", "3C", "4D", "5E", "6F"];
  const tiles = document.querySelectorAll(".player-tile");
  console.log(tileData, tiles);

  tiles.forEach((tile, index) => (tile.textContent = tileData[index]));
};
