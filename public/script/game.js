const getResource = async (path) => {
  const res = await fetch(path);
  return await res.json();
};

const getAvatar = () => {
  const avatarStore = ["/images/avatars/duck_avatar.png"];
  const randomIndex = Math.floor(Math.random() * avatarStore.length);

  return avatarStore[randomIndex];
};

const cloneTemplates = (id) => {
  const template = document.getElementById(id);
  return template.content.cloneNode(true);
};

const createPlayer = (player) => {
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
    playerSection.appendChild(createPlayer(p));
  });
};

const main = async () => {
  await renderPlayers();
};

globalThis.onload = main;
