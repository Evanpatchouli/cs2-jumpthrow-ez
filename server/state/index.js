import { Server } from 'socket.io';

const clientsMap = new Map();

class State {
  /**
   * @type {Server | null}
   */
  #socket = null;
  get socket() { return this.#socket; }
  set socket(socket) { this.#socket = socket; }
  /**
   * @type {Map<string, object>}
   */
  clients = clientsMap;
}

const state = new State();

export default state;