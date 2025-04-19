import Collapse from "./collapse.js";

const getResource = async (path) => {
  const res = await fetch(path);
  return await res.json();
};

const handlePlaceTile = async (event) => {
  const player = await getResource("/acquire/player-details");
  const tiles = [...player.tiles];
  const id = event.target.id;
  if (tiles.includes(id)) {
    await fetch(`/acquire/place-tile/${id}`, { method: "PATCH" });
    const tile = document.getElementById(id);
    tile.classList.add("place-tile");
    changeFocus(tiles);
    const board = document.getElementById("gameBoard");
    board.removeEventListener("click", handlePlaceTile);
    await updateGameStats();
  }
};

const changeFocus = (tiles) => {
  tiles.forEach((t) => {
    const tile = document.getElementById(t);
    tile.classList.toggle("highlight");
  });
};

const highlight = async () => {
  const player = await getResource("/acquire/player-details");
  const tiles = [...player.tiles];
  changeFocus(tiles);
  const board = document.getElementById("gameBoard");
  board.addEventListener("click", handlePlaceTile);
};

const startTurn = async (isMyTurn) => {
  if (!isMyTurn) {
    await updateGameStats();
    return;
  }
  await highlight();
};

const updateGameStats = async () => {
  const gameStats = await getResource("/acquire/game-stats");
  await startTurn(gameStats.isMyTurn);
};

const updateTiles = (tiles, values) => {
  tiles.forEach((tile, i) => (tile.textContent = values[i] || ""));
};

const renderStocks = (hotelNamesRow, sharesRow) => ([hotel, shares]) => {
  const nameCell = document.createElement("th");
  nameCell.textContent = hotel;
  const shareCell = document.createElement("td");
  shareCell.textContent = shares;
  hotelNamesRow.appendChild(nameCell);
  sharesRow.appendChild(shareCell);
};

const updateStocks = (stocks) => {
  const hotelNamesRow = document.getElementById("hotel-names-row");
  const sharesRow = document.getElementById("shares-row");

  hotelNamesRow.innerHTML = "";
  sharesRow.innerHTML = "";

  Object.entries(stocks).forEach(renderStocks(hotelNamesRow, sharesRow));
};

const updateCash = (cash) => {
  document.getElementById("cash-info").textContent = `$${cash}`;
};

const updatePortfolio = async () => {
  try {
    const data = await getResource("/acquire/player-details");
    const tiles = document.querySelectorAll("#portfolio-tiles .player-tile");
    updateTiles(tiles, [...data.tiles]);
    updateStocks(data.stocks);
    updateCash(data.cash);
  } catch (error) {
    console.error("Failed to update portfolio:", error);
  }
};

const startPortfolioPolling = (interval = 500) => {
  updatePortfolio();
  setInterval(updatePortfolio, interval);
};

const renderGame = () => {
  setInterval(async () => {
    const res = await fetch("/acquire/game-stats");
    const stats = await res.json();
    const { currentPlayer, isMyTurn } = stats;
    const avatar = isMyTurn
      ? document.querySelector("#you")
      : document.querySelector(`#${currentPlayer}`);

    avatar.classList.add("active-player");
  }, 2000);
};

const applyPlayerTemplate = (player) => {
  const playerTemplate = cloneTemplates("players-template");
  const avatar = playerTemplate.querySelector(".player-avatar");

  avatar.setAttribute("src", "/images/avatars/avatar1.jpeg");
  avatar.id = `${player}`;
  playerTemplate.querySelector(".player-name").textContent = player;

  return playerTemplate;
};

const renderPlayers = async () => {
  const players = await getResource("/acquire/players");
  const playerSection = document.getElementById("players");
  players.forEach((p) => {
    playerSection.appendChild(applyPlayerTemplate(p));
  });
};

const setup = async () => {
  const player = await getResource("/acquire/player-details");
  const parent = document.getElementById("tiles");
  const tiles = [...parent.children];
  updateTiles(tiles, [...player.tiles]);

  setTimeout(() => {
    const popup = document.getElementById("tiles-popup");
    popup.style.display = "none";
  }, 5000);
};

const cloneTemplates = (id) => {
  const template = document.getElementById(id);
  return template.content.cloneNode(true);
};

const renderTile = (tileLabel) => {
  const board = cloneTemplates("board");
  const tile = board.querySelector(".tile");
  tile.innerText = tileLabel;
  tile.id = tileLabel;
  return tile;
};

const placeTile = (tiles) => {
  tiles.forEach((t) => {
    const tile = document.getElementById(t);
    tile.classList.add("place-tile");
  });
};

const renderGameBoard = async () => {
  const gameBoard = document.querySelector("#gameBoard");
  const tiles = [];

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  rows.forEach((row) => {
    for (let col = 1; col <= 12; col++) {
      const tileLabel = `${col}${row}`;
      tiles.push(renderTile(tileLabel));
    }
  });

  gameBoard.replaceChildren(...tiles);

  const { independentTiles } = await (await fetch("acquire/gameboard")).json();
  console.log(independentTiles);
  placeTile(independentTiles);

  setTimeout(renderGameBoard, 1000);
};

const main = async () => {
  new Collapse("portfolio-header", "portfolio-body");
  renderGameBoard();
  await setup();
  await renderPlayers();
  startPortfolioPolling();
  renderGame();
  // await highlight();
  await updateGameStats();
};

globalThis.onload = main;
