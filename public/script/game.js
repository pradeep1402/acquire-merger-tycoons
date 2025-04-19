import Collapse from "./collapse.js";

const getResource = async (path) => {
  const res = await fetch(path);
  return await res.json();
};

// const highlight = async () => {
//   const player = await getResource("/acquire/player-details");
//   const tiles = [...player.tiles]
//   tiles.forEach(t => {
//     const body = document.querySelector('body');
//     body.classList.add('unfocus')
//     const tile = document.getElementById(t);
//     tile.classList.add('highlight');
//   })
// };

// const updateGameStats = async () => {
//   const { currentPlayer } = await getResource('/acquire/game-stats');
//   const id = currentPlayer.id;
//   const sessionId = document.cookie.sessionId;
// }

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

    console.log(stats);
  }, 2000);
};

const applyPlayerTemplate = (player) => {
  const playerTemplate = cloneTemplates("players-template");
  playerTemplate
    .getElementById("player-avatar")
    .setAttribute("src", "/images/avatars/avatar1.jpeg");
  playerTemplate.getElementById("player-name").textContent = player;
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

const renderGameBoard = () => {
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
};

const main = async () => {
  new Collapse("portfolio-header", "portfolio-body");
  renderGameBoard();
  await setup();
  await renderPlayers();
  startPortfolioPolling();
  renderGame();
  // await highlight();
  // updateGameStats()
};

globalThis.onload = main;
