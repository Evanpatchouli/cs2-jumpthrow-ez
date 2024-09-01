import { create } from "zustand";
import { socket } from "../socket";

/**
 * @type {import("../types").Monitor.Cache}
 */
const useCache = create((set) => ({
  socketConnected: socket.connected,
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}))

export default useCache;