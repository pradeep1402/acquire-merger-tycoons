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

const renderTile = (gameBoard) => {
  return (tileInstance) => {
    const clone = cloneTemplates("board");
    const tile = clone.querySelector(".tile");

    tile.innerText = tileInstance.label;
    gameBoard.appendChild(tile);
  };
};

const renderGameBoard = async () => {
  const board = await getResource("/acquire/gameboard");
  const gameBoard = document.querySelector("#gameBoard");

  board.forEach(renderTile(gameBoard));
};

const setup = async () => {
  const player = await getResource("acquire/playerDetails");
  const tiles = document.querySelectorAll(".player-tile");
  const tileData = [...player.tiles];

  tiles.forEach((tile, index) => (tile.textContent = tileData[index]));

  setTimeout(() => {
    const popup = document.getElementById("tiles-popup");
    popup.style.display = "none";
  }, 2500);
};

const main = async () => {
  await renderGameBoard();
  await setup();
  await renderPlayers();
};

globalThis.onload = main;
