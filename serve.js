import main from "./main.js";
import server from "./server/index.js";
import serverState from './server/state/index.js';

const { socket } = serverState;

// Start the interception at terminal directly.
server.listen(() => {
  main({
    onListen: () => {
      socket?.emit?.("status", true);
    },
    offListen: () => {
      socket?.emit?.("status", false);
    },
    socket,
  });
});