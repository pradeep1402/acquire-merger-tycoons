const getResource = async (path) => {
  const res = await fetch(path);
  return await res.json();
};

const getAvatar = () => {
  const avatarStore = ["/images/avatars/avatar1.jpeg"];
  const randomIndex = Math.floor(Math.random() * avatarStore.length);

  return avatarStore[randomIndex];
};

const cloneTemplates = (id) => {
  const template = document.getElementById(id);
  return template.content.cloneNode(true);
};

const applyPlayerTemplate = (player) => {
  const playerTemplate = cloneTemplates("players-template");
  playerTemplate
    .getElementById("player-avatar")
    .setAttribute("src", getAvatar());
  playerTemplate.getElementById("player-name").textContent = player.name;

  return playerTemplate;
};

const renderPlayers = async () => {
  const players = await getResource("../acquire/players");
  const playerSection = document.getElementById("players");

  players.forEach((p) => {
    playerSection.appendChild(applyPlayerTemplate(p));
  });
};

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

const setup = async () => {
  const res = await fetch("acquire/playerDetails");
  console.log(res);

  const player = await res.json();
  const tiles = document.querySelectorAll(".player-tile");
  const tileData = [...player.tiles];
  console.log(tileData, tiles);

  tiles.forEach((tile, index) => (tile.textContent = tileData[index]));
  setTimeout(() => {
    const popup = document.getElementById("tiles-popup");
    console.log(popup);

    popup.style.display = "none";
  }, 2500);
};

const main = async () => {
  await renderGameBoard();
  await setup();
  await renderPlayers();
};

globalThis.onload = main;
