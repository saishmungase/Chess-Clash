import { useEffect, useState } from "react";

const WS_URL = 'wss://chess-clash.onrender.com';

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };


    return () => {
      console.log("Closing WebSocket connection");
      ws.close();
    };
  }, []);

  return socket;
};