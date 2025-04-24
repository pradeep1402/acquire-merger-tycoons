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

const placeIndependentTile = async (placeInfo, poller, activeHotels) => {
  const placedTile = document.getElementById(placeInfo.tile);
  placedTile.classList.add("place-tile");
  if (activeHotels.length) return await buyStocks(poller);
  await changeTurn(poller);
};

const placeDependentTile = async ({ tile, hotel }, poller) => {
  const placedTile = document.getElementById(tile);
  placedTile.style.backgroundColor = hotelLookup(hotel.name).backgroundColor;
  await buyStocks(poller);
};

const changeTurn = async (poller) => {
  const res = await fetch("/acquire/end-turn", {
    method: "PATCH",
  });
  poller.start();

  return await res.json();
};

const handleFoundHotel = (tileLabel, hotelName, poller) => async () => {
  await fetch(`/acquire/place-tile/${tileLabel}/${hotelName}`, {
    method: "PATCH",
  });

  const container = document.querySelector("#popup");
  container.style.display = "none";
  renderGamerBoard();
  await buyStocks(poller);
};

const renderMinimap = () => {
  const minimap = document.querySelector(".gameBoard");
  minimap.classList.add("minimap");
  const children = minimap.children;

  for (const child of children) {
    child.classList.add("mini-tile");
  }
};

const renderGamerBoard = () => {
  const minimap = document.querySelector(".gameBoard");
  minimap.classList.remove("minimap");
  const children = minimap.children;

  for (const child of children) {
    child.classList.remove("mini-tile");
  }
};

const renderSelectHotel = async (inActiveHotels, tileLabel, poller) => {
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

    div.classList.add(hotel.name.toLowerCase());
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

  if (inActiveHotels.length === 0) return await buyStocks(poller);
};

const createTileClickHandler =
  (tiles, poller, activeHotels) => async (event) => {
    const id = event.target.id;

    if (!tiles.includes(id)) return;

    const res = await fetch(`/acquire/place-tile/${id}`, {
      method: "PATCH",
    });

    const placeInfo = await res.json();
    removeHighlight(tiles);

    if (placeInfo.type === "Independent") {
      await placeIndependentTile(placeInfo, poller, activeHotels);
    }

    if (placeInfo.type === "Dependent") {
      await placeDependentTile(placeInfo, poller);
    }

    if (placeInfo.type === "Build") {
      renderSelectHotel(placeInfo.inActiveHotels, id, poller);
    }

    if (placeInfo.type === "Merge") {
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

const renderPlayerTurn = (isMyTurn, tiles, poller, activeHotels) => {
  if (!isMyTurn) return;
  poller.pause();

  highlight(tiles);
  const board = document.querySelector(".gameBoard");
  board.addEventListener(
    "click",
    createTileClickHandler(tiles, poller, activeHotels),
    {
      once: true,
    },
  );
};

const renderPlayerTiles = (tilesContainer, tiles) => {
  tilesContainer.innerText = "";
  tiles.forEach((tile) => {
    const playerTile = cloneTemplates("assigned-tile").querySelector(
      ".player-tile",
    );
    playerTile.textContent = tile;
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
    Tower: { backgroundColor: "#ffb404", color: "black" },
    Sackson: { backgroundColor: "#ff5454", color: "white" },
    Festival: {
      backgroundColor: "#48c454",
      color: "white",
    },
    Continental: {
      backgroundColor: "#28c4e4",
      color: "white",
    },
    Imperial: {
      backgroundColor: "#ff7c14",
      color: "white",
    },
    Worldwide: {
      backgroundColor: "#8054f4",
      color: "white",
    },
    American: {
      backgroundColor: "#288ce4",
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

class HotelView {
  #name;
  #stocksAvailable;
  #stockPrice;
  constructor(name, stocksAvailable, stockPrice) {
    this.#name = name;
    this.#stocksAvailable = stocksAvailable;
    this.#stockPrice = stockPrice;
  }

  renderStocks() {
    const div = document.createElement("div");
    div.innerText =
      `${this.#name} : ${this.#stocksAvailable} ($${this.#stockPrice})`;

    return div;
  }

  static fromHotel(hotel) {
    return new HotelView(hotel.name, hotel.stocksAvailable, hotel.stockPrice);
  }
}

class HotelsView {
  #activeHotels;
  #inactiveHotels;
  constructor(activeHotels, inActiveHotels) {
    this.#activeHotels = activeHotels;
    this.#inactiveHotels = inActiveHotels;
  }

  renderStocks() {
    const stocksSection = document.querySelector("#stocks-section");
    const hotelElements = this.#activeHotels
      .concat(this.#inactiveHotels)
      .map((hotel) => HotelView.fromHotel(hotel))
      .map((hotelView) => hotelView.renderStocks());

    stocksSection.replaceChildren(...hotelElements);
  }
}

const renderInActiveHotels = (inActiveHotels) => {
  const inActiveHotelsSection = document.querySelector("#inactive-hotels");
  inActiveHotelsSection.innerText = "";

  for (const { name } of inActiveHotels) {
    const template = cloneTemplates("inactive-hotels-template");

    const img = template.querySelector("img");
    img.setAttribute("src", `/images/hotels/${name.toLowerCase()}.png`);

    const hotelName = template.querySelector("p");
    hotelName.textContent = name;

    inActiveHotelsSection.appendChild(template);
  }
};

const renderStocksAndInactiveHotels = (inActiveHotels, activeHotels) => {
  new HotelsView(activeHotels, inActiveHotels).renderStocks();
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

const showStartingTilesPopup = async () => {
  const stats = await getResource("/acquire/game-stats");
  const { playerPortfolio } = stats;
  const { tiles } = playerPortfolio;
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

const updateMax = () => {
  const allInputs = document.querySelectorAll("#active-hotels input");
  const maxAllowed = 3;

  const totalSelected = Array.from(allInputs).reduce((sum, input) => {
    return sum + parseInt(input.value || 0);
  }, 0);

  allInputs.forEach((input) => {
    const currentValue = parseInt(input.value || 0);
    const otherTotal = totalSelected - currentValue;
    input.max = Math.max(0, maxAllowed - otherTotal);
  });
};

const setHotelInfo = (template, name, price, maxStocks) => {
  template.querySelector("#hotel-name").textContent = name;
  template.querySelector("#stock-value").textContent = price;

  const input = template.querySelector("input");
  input.id = name;
  input.max = maxStocks;
  input.value = 0;
};

const attachInputHandlers = (input) => {
  input.addEventListener("input", (event) => {
    updateMax(event);
  });
};

const debitCash = (stockPrice) => {
  const cash = document.getElementById("cash-available");
  const amount = Number(cash.textContent);

  cash.textContent = amount - stockPrice;
};

const creditCash = (stockPrice) => {
  const cash = document.getElementById("cash-available");
  const amount = Number(cash.textContent);

  cash.textContent = amount + stockPrice;
};

const attachStepButtons = (stockPrice, template, input) => {
  const [decrement, increment] = template.querySelectorAll("button");

  increment.addEventListener("click", () => {
    const prevValue = parseInt(input.value);
    input.stepUp();
    const newValue = parseInt(input.value);

    if (newValue > prevValue) {
      debitCash(stockPrice);
      input.dispatchEvent(new Event("input"));
    }
  });

  decrement.addEventListener("click", () => {
    const prevValue = parseInt(input.value);
    input.stepDown();
    const newValue = parseInt(input.value);

    if (newValue < prevValue) {
      creditCash(stockPrice);
      input.dispatchEvent(new Event("input"));
    }
  });
};

const renderHotel = ({ name, stocksAvailable, stockPrice }) => {
  const template = cloneTemplates("hotel-template");
  const maxStocks = stocksAvailable >= 3 ? 3 : stocksAvailable;
  const input = template.querySelector("input");

  setHotelInfo(template, name, stockPrice, maxStocks);
  attachInputHandlers(input);
  attachStepButtons(stockPrice, template, input);

  return template;
};

const renderAllHotels = (hotelsData) => {
  const hotelsContainer = document.getElementById("active-hotels");
  hotelsContainer.textContent = "";
  hotelsData.forEach((hotel) => {
    const hotelEl = renderHotel(hotel);
    hotelsContainer.appendChild(hotelEl);
  });
};

const setCash = (amount) => {
  const cashAvailable = document.getElementById("cash-available");
  cashAvailable.textContent = amount;
};

const handleBuy = async () => {
  const activeHotels = document.getElementById("active-hotels");
  console.log(activeHotels);
  const children = activeHotels.children;
  const stocksToBuy = [];

  for (const child of children) {
    const hotel = child.querySelector("#hotel-name").textContent;
    const count = +child.querySelector("input").value;
    if (count) stocksToBuy.push({ hotel, count });
  }

  console.log(stocksToBuy);
  const buyStocksEle = document.getElementById("buy-stocks");
  buyStocksEle.classList.remove("display");
  const res = await fetch("/acquire/buy-stocks", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      body: JSON.stringify(stocksToBuy),
    },
  });
  console.log(await res.json());
};

const buyStocks = async (poller) => {
  const { board, playerPortfolio } = await getResource("/acquire/game-stats");
  const { activeHotels } = board;
  const { cash } = playerPortfolio;
  const buyStocksEle = document.getElementById("buy-stocks");
  buyStocksEle.classList.add("display");

  const submit = document.getElementById("buy");
  submit.addEventListener("click", handleBuy);

  setCash(cash);
  renderAllHotels(activeHotels);
  await changeTurn(poller);
};

const startGamePolling = async (poller) => {
  const stats = await getResource("/acquire/game-stats");
  const { players, board, isMyTurn, currentPlayer, playerPortfolio } = stats;
  const { tiles } = playerPortfolio;
  const { inActiveHotels, activeHotels } = board;

  renderStocksAndInactiveHotels(inActiveHotels, activeHotels);
  // showStartingTilesPopup(tiles);
  renderPlayers(players, currentPlayer);
  renderPlayerTurn(isMyTurn, tiles, poller, activeHotels);
  renderPortfolio(playerPortfolio);
  renderPlaceTilesBoard(board);
};

const main = () => {
  const portfolio = new Collapse("tray-header", "tray-body");
  const sideBar = new Collapse("portfolio-header", "portfolio-body");
  portfolio.init();
  sideBar.init();
  showStartingTilesPopup();
  renderGameBoard();

  const polling = new Poller(1000, startGamePolling);
  polling.start();
};

globalThis.onload = main;
