import Collapse from "./collapse.js";

const getResource = async (path) => {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (error) {
    console.error(`In getResourse: ${path}, ${error}`);
  }
};

const createTileClickHandler = (tiles) => async (event) => {
  const id = event.target.id;
  if (!tiles.includes(id)) return;

  await fetch(`/acquire/place-tile/${id}`, { method: "PATCH" });
  const tile = document.getElementById(id);
  tile.classList.add("place-tile");
  removeHighlight(tiles);
};

const highlight = (tiles) => {
  tiles.forEach((tile) => {
    const tileNode = document.getElementById(tile);
    tileNode.classList.add("highlight");
  });
};

const removeHighlight = (tiles) => {
  tiles.forEach((tile) => {
    const tileNode = document.getElementById(tile);
    tileNode.classList.remove("highlight");
  });
};

const handlePlayerTurn = (isMyTurn, tiles) => {
  if (!isMyTurn) return;

  highlight(tiles);
  const board = document.getElementById("gameBoard");
  board.addEventListener("click", createTileClickHandler(tiles));
};

const renderPlayerTiles = (tilesContainer, tiles) => {
  tilesContainer.innerText = "";
  tiles.forEach((tile) => {
    const playertile = cloneTemplates("assigned-tile").querySelector(
      ".player-tile",
    );
    playertile.innerText = tile;
    tilesContainer.appendChild(playertile);
  });
};

const renderStockRow = (hotelNamesRow, sharesRow) => ([hotel, shares]) => {
  const nameCell = document.createElement("th");
  nameCell.textContent = hotel;
  const shareCell = document.createElement("td");
  shareCell.textContent = shares;
  hotelNamesRow.appendChild(nameCell);
  sharesRow.appendChild(shareCell);
};

const renderStocks = (stocks) => {
  const hotelNamesRow = document.getElementById("hotel-names-row");
  const sharesRow = document.getElementById("shares-row");

  hotelNamesRow.innerHTML = "";
  sharesRow.innerHTML = "";

  Object.entries(stocks).forEach(renderStockRow(hotelNamesRow, sharesRow));
};

const renderCash = (cash) => {
  document.getElementById("cash-info").textContent = `$${cash}`;
};

const renderPortfolio = ({ tiles, stocks, cash }) => {
  const tilesContainer = document.querySelector("#portfolio-tiles");
  renderPlayerTiles(tilesContainer, tiles);
  renderStocks(stocks);
  renderCash(cash);
};

const renderIndependentTiles = (tiles) => {
  tiles.forEach((tile) => {
    const tileNode = document.getElementById(tile);
    tileNode.classList.add("place-tile");
  });
};

const renderPlaceTilesBoard = (board) => {
  const { independentTiles } = board;

  renderIndependentTiles(independentTiles);
};

const startGamePolling = () => {
  setInterval(async () => {
    const stats = await getResource("/acquire/game-stats");
    const { players, board, isMyTurn, currentPlayer, playerPortfolio } = stats;
    const { tiles } = playerPortfolio;

    showStartingTilesPopup(tiles);
    renderPlayers(players, currentPlayer);
    handlePlayerTurn(isMyTurn, tiles);
    renderPortfolio(playerPortfolio);
    renderPlaceTilesBoard(board);
  }, 2000);
};

const createPlayerAvatar = ({ name, isYou }, currentPlayer) => {
  const playerIcon = cloneTemplates("players-template");
  const avatar = playerIcon.querySelector(".player-avatar");

  avatar.setAttribute("src", "/images/avatars/avatar1.jpeg");
  playerIcon.querySelector(".player-name").textContent = isYou
    ? `${name} (YOU)`
    : name;
  currentPlayer === name && avatar.classList.add("active-player");

  return playerIcon;
};

const renderPlayers = (players, currentPlayer) => {
  const playerSection = document.getElementById("players");
  playerSection.innerText = "";
  players.forEach((player) => {
    playerSection.appendChild(createPlayerAvatar(player, currentPlayer));
  });
};

const showStartingTilesPopup = (tiles) => {
  const container = document.getElementById("tiles-container");
  renderPlayerTiles(container, tiles);

  setTimeout(() => {
    const popup = document.getElementById("tiles-popup");
    popup.style.display = "none";
  }, 100);
};

const cloneTemplates = (id) => {
  const template = document.getElementById(id);
  return template.content.cloneNode(true);
};

const createTile = (tileLabel) => {
  const board = cloneTemplates("board");
  const tile = board.querySelector(".tile");
  tile.innerText = tileLabel;
  tile.id = tileLabel;
  return tile;
};

const renderGameBoard = () => {
  const tiles = [];
  const gameBoard = document.querySelector("#gameBoard");
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  rows.forEach((row) => {
    for (let col = 1; col <= 12; col++) {
      const tileLabel = `${col}${row}`;
      tiles.push(createTile(tileLabel));
    }
  });

  gameBoard.replaceChildren(...tiles);
};

const main = () => {
  new Collapse("portfolio-header", "portfolio-body");
  renderGameBoard();
  startGamePolling();
};

globalThis.onload = main;
