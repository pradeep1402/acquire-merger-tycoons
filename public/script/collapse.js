export default class Collapse {
  #trigger;
  #target;

  constructor(triggerId, targetId) {
    this.#trigger = document.getElementById(triggerId);
    this.#target = document.getElementById(targetId);
  }

  init() {
    if (!this.#trigger || !this.#target) {
      console.warn("Trigger or target element not found.");
      return;
    }

    this.#trigger.addEventListener("click", this.#toggle.bind(this));
  }

  #toggle() {
    this.#toggleTarget();
    this.#toggleIcons();
  }

  #toggleTarget() {
    this.#target.classList.toggle("hidden");
    this.#target.classList.toggle("display");
  }

  #toggleIcons() {
    this.#toggleElement(".collapse");
    this.#toggleElement(".open");
  }

  #toggleElement(selector) {
    const el = this.#trigger.querySelector(selector);
    if (el) el.classList.toggle("hidden");
  }
}
