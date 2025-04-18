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
  const intervalId = setInterval(async () => {
    const res = await (await fetch("/acquire/gameStatus")).json();
    console.log(res);
    if (res.status === "START") {
      clearInterval(intervalId);
      globalThis.location = "/game.html";
    }

    const players = res.players;
    const playerList = document.getElementById("player-list");

    players.forEach((p) => {
      playerList.appendChild(applyPlayerTemplate(p));
    });
  }, 1000);
};

const main = () => {
  renderWaitingList();
};

globalThis.onload = main;
