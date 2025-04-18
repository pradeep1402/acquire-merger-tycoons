const applyPlayerTemplate = (player) => {
  const template = document.getElementById("lobby-template");
  const clone = template.content.cloneNode(true);

  clone
    .getElementById("player-avatar")
    .setAttribute("src", "/images/avatars/avatar3.jpeg");
  clone.getElementById("player-name").textContent = player.name;

  return clone;
};

const renderWaitingList = () => {
  const playerList = document.getElementById("player-list");

  const intervalId = setInterval(async () => {
    const res = await (await fetch("/acquire/gameStatus")).json();

    if (res.status === "START") {
      clearInterval(intervalId);
      globalThis.location = "/game.html";
    }

    const players = res.players;
    playerList.innerHTML = "";
    players.forEach((p) => {
      playerList.appendChild(applyPlayerTemplate(p));
    });
  }, 1000);
};

const main = () => {
  renderWaitingList();
};

globalThis.onload = main;
