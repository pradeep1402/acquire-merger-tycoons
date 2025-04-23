import Collapse from "./collapse.js";
import Poller from "./polling.js";

const getResource = async (path) => {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (error) {
    console.error(`In getResource: ${path}, ${error}`);
  }
};

const handleFoundHotel = (tileLabel, hotelName, poller) => async () => {
  await fetch(`/acquire/place-tile/${tileLabel}/${hotelName}`, {
    method: "PATCH",
  });

  const container = document.querySelector("#popup");
  container.style.display = "none";
  renderGamerBoard();
  poller.start();
};

const renderMinimap = () => {
  const minimap = document.querySelector(".gameBoard");
  minimap.classList.add("minimap");
  const children = minimap.children;

  for (const child of children) {
    child.classList.add("minitile");
  }
};

const renderGamerBoard = () => {
  const minimap = document.querySelector(".gameBoard");
  minimap.classList.remove("minimap");
  const children = minimap.children;

  for (const child of children) {
    child.classList.remove("minitile");
  }
};

const renderSelectHotel = (inActiveHotels, tileLabel, poller) => {
  const container = document.querySelector("#popup");
  renderMinimap();

  const hotelList = document.querySelector("#hotel-container");
  container.style.display = "block";
  hotelList.textContent = "";

  inActiveHotels.forEach((hotel) => {
    const outerDiv = document.createElement("div");
    const hotelName = document.createElement("span");
    hotelName.textContent = hotel.name;
    const div = document.createElement("div");

    div.style.backgroundImage = "url('/images/hotels" +
      hotelLookup(hotel.name).image + "')";
    div.classList.add("select-hotel");

    outerDiv.appendChild(hotelName);
    outerDiv.appendChild(div);

    outerDiv.addEventListener(
      "click",
      handleFoundHotel(tileLabel, hotel.name, poller),
      {
        once: true,
      },
    );
    hotelList.appendChild(outerDiv);
  });
};

const createTileClickHandler = (tiles, poller) => async (event) => {
  const id = event.target.id;

  if (!tiles.includes(id)) return;

  const res = await fetch(`/acquire/place-tile/${id}`, {
    method: "PATCH",
  });

  const playerInfo = await res.json();
  removeHighlight(tiles);

  if (playerInfo.type === "Build") {
    poller.pause();
    renderSelectHotel(playerInfo.inActiveHotels, id, poller);
  }
  if (playerInfo.type === "Merge") {
    poller.pause();
    renderMergerTile(id);
    removeHighlight(tiles);
  }
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

const renderPlayerTurn = (isMyTurn, tiles, poller) => {
  if (!isMyTurn) return;

  highlight(tiles);
  const board = document.querySelector(".gameBoard");
  board.addEventListener("click", createTileClickHandler(tiles, poller), {
    once: true,
  });
};

const renderPlayerTiles = (tilesContainer, tiles) => {
  tilesContainer.innerText = "";
  tiles.forEach((tile) => {
    const playerTile = cloneTemplates("assigned-tile").querySelector(
      ".player-tile",
    );
    playerTile.innerText = tile;
    tilesContainer.appendChild(playerTile);
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

  hotelNamesRow.textContent = "";
  sharesRow.textContent = "";

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

const hotelLookup = (name) => {
  const colors = {
    Tower: { backgroundColor: "yellow", color: "black" },
    Sackson: { backgroundColor: "red", color: "white" },
    Festival: {
      backgroundColor: "#3C8A6A",
      color: "white",
    },
    Continental: {
      backgroundColor: "#7ECDEE",
      color: "white",
    },
    Imperial: {
      backgroundColor: "#DA9306",
      color: "white",
    },
    Worldwide: {
      backgroundColor: "#6C3E80",
      color: "white",
    },
    American: {
      backgroundColor: "#2360A5",
      color: "white",
    },
  };

  return colors[name];
};

const displayHotelIcon = (name, tile) => {
  const tileElem = document.getElementById(tile);
  tileElem.classList.add(name.toLowerCase());
  tileElem.textContent = "";
};

const renderAHotel = ({ name, tiles, baseTile }) => {
  displayHotelIcon(name, baseTile);

  tiles.forEach((t) => {
    const tile = document.getElementById(t);
    tile.style.backgroundColor = hotelLookup(name).backgroundColor;
    tile.style.color = hotelLookup(name).color;
  });
};

const renderHotels = (hotels) => {
  hotels.forEach((h) => {
    renderAHotel(h);
  });
};

const renderMergerTile = (tile) => {
  const tileElem = document.getElementById(tile);
  tileElem.style.backgroundColor = "lightgrey";
};

const renderPlaceTilesBoard = (board) => {
  const { independentTiles, activeHotels, mergerTile } = board;
  renderIndependentTiles(independentTiles);

  if (!activeHotels) return;
  if (mergerTile.length) renderMergerTile(mergerTile[0]);

  renderHotels(activeHotels);
};

const renderStocksOfAllHotels = (activeHotels, inActiveHotels) => {
  const hotels = [...activeHotels, ...inActiveHotels];
  const stocksSection = document.querySelector("#stocks-section");
  stocksSection.innerText = "";

  for (const { name, stocksAvailable, stockPrice } of hotels) {
    const div = document.createElement("div");
    div.innerText = `${name} : ${stocksAvailable} ($${stockPrice})`;
    stocksSection.appendChild(div);
  }
};

const renderInActiveHotels = (inActiveHotels) => {
  const inActiveHotelsSection = document.querySelector("#inactive-hotels");
  inActiveHotelsSection.innerText = "";

  for (const { name } of inActiveHotels) {
    const div = document.createElement("div");
    div.innerText = name;
    inActiveHotelsSection.appendChild(div);
  }
};

const renderStocksAndInactiveHotels = (inActiveHotels, activeHotels) => {
  renderStocksOfAllHotels(activeHotels, inActiveHotels);
  renderInActiveHotels(inActiveHotels);
};

const createPlayerAvatar = ({ name, isTheSamePlayer }, currentPlayer) => {
  const playerIcon = cloneTemplates("players-template");
  const avatar = playerIcon.querySelector(".player-avatar");

  avatar.setAttribute("src", "/images/avatars/logo.png");
  playerIcon.querySelector(".player-name").textContent = isTheSamePlayer
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
  }, 2000);
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

const startGamePolling = async (poller) => {
  const stats = await getResource("/acquire/game-stats");
  const { players, board, isMyTurn, currentPlayer, playerPortfolio } = stats;
  const { tiles } = playerPortfolio;
  const { inActiveHotels, activeHotels } = board;

  renderStocksAndInactiveHotels(inActiveHotels, activeHotels);
  showStartingTilesPopup(tiles);
  renderPlayers(players, currentPlayer);
  renderPlayerTurn(isMyTurn, tiles, poller);
  renderPortfolio(playerPortfolio);
  renderPlaceTilesBoard(board);
};

const main = () => {
  new Collapse("tray-header", "tray-body");
  new Collapse("portfolio-header", "portfolio-body");
  renderGameBoard();

  const polling = new Poller(1000, startGamePolling);
  polling.start();
};

globalThis.onload = main;
