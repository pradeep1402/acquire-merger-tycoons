export default class Poller {
  #time;
  #callback;
  #intervalId;

  constructor(time, callback) {
    this.#time = time;
    this.#callback = callback;
  }

  start() {
    this.#intervalId = setInterval(() => this.#callback(this), this.#time);
  }

  pause() {
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }
}
