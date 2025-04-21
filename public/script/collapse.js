export default class Collapse {
  constructor(triggerId, targetId) {
    this.trigger = document.getElementById(triggerId);
    this.target = document.getElementById(targetId);

    if (this.trigger && this.target) {
      this.trigger.addEventListener("click", () => this.toggle());
    } else {
      console.warn("Trigger or target element not found.");
    }
  }

  toggle() {
    this.target.classList.toggle("hidden");
    this.target.classList.toggle("display");
    const trayHeader = this.trigger;
    const toggleHide = (sel) =>
      trayHeader.querySelector(sel).classList.toggle("hidden");
    ".collapse .open".split(" ").forEach(toggleHide);
  }
}
