const fetchGameBoard = async () => {
  try {
    const res = await fetch("/acquire/gameboard");
    return await res.json();
  } catch (error) {
    console.error(`Fetching Game Board: ${error}`);
  }
};

const renderTile = (template, gameboard) => {
  return (tileInstance) => {
    const clone = template.content.cloneNode(true);
    const tile = clone.querySelector(".tile");

    tile.innerText = tileInstance.label;
    gameboard.appendChild(tile);
  };
};

const renderGameBoard = async () => {
  const board = await fetchGameBoard();
  const template = document.querySelector("#board");
  const gameboard = document.querySelector("#gameBoard");

  board.forEach(renderTile(template, gameboard));
};

const main = async () => {
  await renderGameBoard();
};

globalThis.onload = main;
