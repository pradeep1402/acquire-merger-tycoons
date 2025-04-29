import Collapse from "./collapse.js";
import {
  PlayersView,
  PlayerTurnView,
  StockExchangeView,
  toggleBlur,
} from "./views.js";
import Poller from "./polling.js";
import {
  BoardView,
  BuyStocksView,
  HotelsView,
  PortfolioView,
} from "./views.js";

export const getResource = async (path) => {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (error) {
    console.error(`In getResource: ${path}, ${error}`);
  }
};

const renderPlayerTurn = (isMyTurn, tiles, poller) => {
  if (!isMyTurn) return;

  new PlayerTurnView(tiles, poller).enableTurn();
};

const renderPortfolio = ({ tiles, stocks, cash }) => {
  new PortfolioView(tiles, stocks, cash).renderPortfolio();
};

const renderPlaceTilesBoard = (board) => {
  new BoardView(board).render();
};

const renderStocksAndPlayers = (
  players,
  currentPlayer,
  inActiveHotels,
  activeHotels,
) => {
  new HotelsView(activeHotels, inActiveHotels).renderStocks();
  new PlayersView(players, currentPlayer).renderPlayers();
};

const renderPlayerTiles = (tilesContainer, tiles) => {
  const tilesEle = tiles.map((tile) => {
    const playerTile = cloneTemplate("assigned-tile").querySelector(
      ".player-tile",
    );
    playerTile.textContent = tile;
    return playerTile;
  });

  tilesContainer.replaceChildren(...tilesEle);
};

const showStartingTilesPopup = async () => {
  toggleBlur();
  const stats = await getResource("/acquire/game-stats");
  const { playerPortfolio } = stats;
  const { tiles } = playerPortfolio;
  const container = document.getElementById("tiles-container");
  renderPlayerTiles(container, tiles);

  setTimeout(() => {
    const popup = document.getElementById("tiles-popup");
    toggleBlur();
    popup.style.display = "none";
  }, 2000);
};

export const cloneTemplate = (id) => {
  const template = document.getElementById(id);
  return template.content.cloneNode(true);
};

const createTile = (tileLabel) => {
  const board = cloneTemplate("board");
  const tile = board.querySelector(".tile");
  tile.textContent = tileLabel;
  tile.id = tileLabel;
  return tile;
};

const renderGameBoard = () => {
  const tiles = [];
  const gameBoard = document.querySelector(".gameBoard");
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  rows.forEach((row) => {
    for (let col = 1; col <= 12; col++) {
      const tileLabel = `${col}${row}`;
      tiles.push(createTile(tileLabel));
    }
  });

  gameBoard.replaceChildren(...tiles);
};

const renderGameEndBtn = () => {
  const btn = document.getElementById("end-game");
  btn.style.visibility = "visible";
  btn.addEventListener("click", async () => {
    const { winner } = await (await fetch("/acquire/game-end")).json();
    alert(`winner is ${winner}`);
  });
};

const keepSellTrade = (portfolio, { acquirer, target }, poller) => {
  document
    .querySelector(`.${target.toLowerCase()}`)
    .classList.remove("base-tile");
  document
    .querySelector(`.${target.toLowerCase()}`)
    .classList.remove(`.${target.toLowerCase()}`);

  poller.pause();
  const stocks = portfolio.stocks[target];

  new StockExchangeView(stocks, acquirer, target, poller).render();
};

const renderFlashMsg = (msg) => {
  const msgBox = document.getElementById("flash-msg-box");
  msgBox.style.visibility = "visible";
  const textBox = msgBox.querySelector("p");
  textBox.textContent = msg;
  setTimeout(() => {
    msgBox.style.visibility = "hidden";
    textBox.textContent = null;
  }, 3000);
};

const buyStocksAfterMerger = (board, playerPortfolio, poller) => {
  poller.pause();
  new BuyStocksView(board.activeHotels, playerPortfolio.cash, poller).render();
};

const startGamePolling = async (poller) => {
  const stats = await getResource("/acquire/game-stats");
  const {
    players,
    board,
    isMyTurn,
    currentPlayer,
    mode,
    playerPortfolio,
    isGameEnd,
    mergeData,
  } = stats;

  const { tiles } = playerPortfolio;
  const { inActiveHotels, activeHotels } = board;
  console.log(activeHotels);

  if (isGameEnd) {
    const msg = "You can end the game";
    renderFlashMsg(msg);
    renderGameEndBtn();
  }

  renderStocksAndPlayers(players, currentPlayer, inActiveHotels, activeHotels);
  renderPortfolio(playerPortfolio);
  renderPlaceTilesBoard(board);

  if (mergeData && mergeData.mode === "Merge" && isMyTurn) {
    keepSellTrade(playerPortfolio, mergeData, poller);
  } else if (mode === "postMerge" && isMyTurn) {
    buyStocksAfterMerger(board, playerPortfolio, poller);
  } else {
    renderPlayerTurn(isMyTurn, tiles, poller);
  }
};

const handleLogout = async () => {
  console.log("logout called");
  await fetch("./logout", { method: "GET" });
  globalThis.location.href = "./login.html";
};

const logout = () => {
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", handleLogout);
};

const main = () => {
  const portfolio = new Collapse("tray-header", "tray-body");
  const sideBar = new Collapse("portfolio-header", "portfolio-body");
  portfolio.init();
  sideBar.init();
  showStartingTilesPopup();
  renderGameBoard();
  logout();

  const polling = new Poller(1000, startGamePolling);
  polling.start();
};

globalThis.onload = main;
