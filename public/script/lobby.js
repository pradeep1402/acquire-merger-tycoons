const applyPlayerTemplate = (player) => {
  const template = document.getElementById("lobby-template");
  const clone = template.content.cloneNode(true);

  clone
    .getElementById("player-avatar")
    .setAttribute("src", "/images/avatars/avatar1.jpeg");
  clone.getElementById("player-name").textContent = player.name;

  return clone;
};

const renderWaitingList = () => {
  const playerList = document.getElementById("player-list");

  const intervalId = setInterval(async () => {
    const res = await (await fetch("/acquire/game-status")).json();

    if (res.status === "START") {
      clearInterval(intervalId);
      globalThis.location = "/game.html";
    }

    const players = res.players;
    playerList.textContent = "";
    players.forEach((player) => {
      playerList.appendChild(applyPlayerTemplate(player));
    });
  }, 3000);
};

const main = () => {
  renderWaitingList();
};

globalThis.onload = main;
