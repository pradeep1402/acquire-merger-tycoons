const applyPlayerTemplate = (player) => {
  const template = document.getElementById("lobby-template");
  const clone = template.content.cloneNode(true);

  clone
    .getElementById("player-avatar")
    .setAttribute("src", "/images/avatars/avatar3.jpeg");
  clone.getElementById("player-name").textContent = player;

  return clone;
};

const renderWaitingList = () => {
  const players = ["boy", "girl", "pragna", "krishna"];
  const playerList = document.getElementById("player-list");

  players.forEach((p) => {
    playerList.appendChild(applyPlayerTemplate(p));
  });
};

const main = () => {
  renderWaitingList();
};

globalThis.onload = main;
