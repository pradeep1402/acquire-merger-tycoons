import Collapse from "./collapse.js";

const getResource = async (path) => {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (error) {
    console.error(`In getResource: ${path}, ${error}`);
  }
};

const handleFoundHotel = (tileLabel, playerTiles) => async (event) => {
  await fetch(`/acquire/place-tile/${tileLabel}/${event.target.textContent}`, {
    method: "PATCH",
  });

  const container = document.querySelector("#popup");
  container.style.display = "none";
  removeHighlight(playerTiles);
};

const renderSelectHotel = (inActiveHotels, tileLabel, playerTiles) => {
  const container = document.querySelector("#popup");
  const hotelList = document.querySelector("#hotel-container");
  container.style.display = "block";
  hotelList.textContent = "";

  inActiveHotels.forEach((hotel) => {
    const div = document.createElement("div");
    div.textContent = hotel.name;
    div.addEventListener("click", handleFoundHotel(tileLabel, playerTiles), {
      once: true,
    });
    hotelList.appendChild(div);
  });
};

const createTileClickHandler = (tiles) => async (event) => {
  const id = event.target.id;

  if (!tiles.includes(id)) return;

  const res = await fetch(`/acquire/place-tile/${id}`, {
    method: "PATCH",
  });
  const playerInfo = await res.json();
  const tile = document.getElementById(id);
  tile.classList.add("place-tile");
  removeHighlight(tiles);

  if (playerInfo.type === "Build") {
    renderSelectHotel(playerInfo.inActiveHotels, id, tiles);
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

const renderPlayerTurn = (isMyTurn, tiles) => {
  if (!isMyTurn) return;

  highlight(tiles);
  const board = document.querySelector(".gameBoard");
  board.addEventListener("click", createTileClickHandler(tiles), {
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
    Tower: { backgroundColor: "yellow", color: "black", image: "/tower.png" },
    Sackson: { backgroundColor: "red", color: "white", image: "/sackson.png" },
    Festival: {
      backgroundColor: "green",
      color: "white",
      image: "/festival.png",
    },
    Continental: {
      backgroundColor: "sky-blue",
      color: "white",
      image: "/continental.png",
    },
    Imperial: {
      backgroundColor: "orange",
      color: "white",
      image: "/imperial.png",
    },
    Worldwide: {
      backgroundColor: "violet",
      color: "white",
      image: "/worldwide.png",
    },
    American: {
      backgroundColor: "blue",
      color: "white",
      image: "/american.png",
    },
  };

  return colors[name];
};

const displayHotelIcon = (name, tile) => {
  const tileElem = document.getElementById(tile);
  tileElem.textContent = "";
  tileElem.style.backgroundColor = "smokewhite";
  tileElem.style.backgroundImage = "url('/images/hotels" +
    hotelLookup(name).image + "')";
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

const renderPlaceTilesBoard = (board) => {
  const { independentTiles, activeHotels } = board;
  renderIndependentTiles(independentTiles);

  if (!activeHotels) return;

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

const startGamePolling = () => {
  setInterval(async () => {
    const stats = await getResource("/acquire/game-stats");
    const { players, board, isMyTurn, currentPlayer, playerPortfolio } = stats;
    const { tiles } = playerPortfolio;
    const { inActiveHotels, activeHotels } = board;
    renderStocksAndInactiveHotels(inActiveHotels, activeHotels);
    showStartingTilesPopup(tiles);
    renderPlayers(players, currentPlayer);
    renderPlayerTurn(isMyTurn, tiles);
    renderPortfolio(playerPortfolio);
    renderPlaceTilesBoard(board);
  }, 500);
};

const createPlayerAvatar = ({ name, isTheSamePlayer }, currentPlayer) => {
  const playerIcon = cloneTemplates("players-template");
  const avatar = playerIcon.querySelector(".player-avatar");

  avatar.setAttribute("src", "/images/avatars/avatar1.jpeg");
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

const main = () => {
  new Collapse("tray-header", "tray-body");
  new Collapse("portfolio-header", "portfolio-body");
  renderGameBoard();
  startGamePolling();
};

globalThis.onload = main;
