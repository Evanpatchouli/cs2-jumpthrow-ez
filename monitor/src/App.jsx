import { useEffect } from "react";
import useCache from "./cache/index.js";
import { socket } from "./socket/index.js";
import toast from "./utils/toast.js";
import { Toaster } from "react-hot-toast";
import UnConnected from "./components/unconnected.jsx";
import Main from "./components/main.jsx";
import "./App.css";

function App() {
  const cache = useCache();
  const onConnect = () => {
    cache.setSocketConnected(true);
    toast.success("服务已连接");
    socket.emit("status");
  };
  const onDisconnect = () => {
    cache.setSocketConnected(false);
    toast.info("服务已断开");
  };

  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", (data) => {
      toast.info(`Server:${JSON.stringify(data)}`);
    });
    socket.connect();
  }, []);

  return (
    <>
      {cache.socketConnected ? <Main /> : <UnConnected />}
      <Toaster />
    </>
  );
}

export default App;
