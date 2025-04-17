const setup = async () => {
  // const tileData = ["1A", "2B", "3C", "4D", "5E", "6F"];
  // const player = await (await fetch("acquire/players")).json();
  const player = { tiles: new Set(["1A", "2B", "3C", "4D", "5E", "6F"]) };
  const tiles = document.querySelectorAll(".player-tile");
  popup.style.display = "flex";
  const tileData = [...player.tiles];
  console.log(tileData, tiles);

  tiles.forEach((tile, index) => (tile.textContent = tileData[index]));
};

const main = () => {
  setTimeout(() => {
    setup();
  }, 2000);
};

globalThis.onload = main;
