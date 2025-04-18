const postRequest = async (path) => {
  const res = await fetch(path, { method: "POST" });
  return await res.json();
};

const quickPlayHandler = async () => {
  const status = await postRequest("/acquire/home/quick-play");
  globalThis.location.href = "/lobby.html";
};

const handleQuickPlay = () => {
  const quickPlay = document.getElementById("quick-play");
  quickPlay.addEventListener("click", quickPlayHandler);
};

const main = () => {
  handleQuickPlay();
};

globalThis.onload = main;
