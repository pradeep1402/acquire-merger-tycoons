export default class Collapse {
  constructor(triggerId, targetId, toggleClass = "hidden") {
    this.trigger = document.getElementById(triggerId);
    this.target = document.getElementById(targetId);
    this.toggleClass = toggleClass;

    if (this.trigger && this.target) {
      this.trigger.addEventListener("click", () => this.toggle());
    } else {
      console.warn("Trigger or target element not found.");
    }
  }

  toggle() {
    this.target.classList.toggle("hidden");
    this.target.classList.toggle("display");
  }
}
