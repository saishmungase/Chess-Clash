import { WebSocketServer } from 'ws';
import { GameManager } from './gameManager';

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

console.log("WebSocket server started on port 8080");

wss.on("connection", function connection(ws) {
    console.log("New client connected");
    gameManager.addUser(ws);
    
    ws.on("close", () => {
        console.log("Client disconnected");
        gameManager.removeUser(ws);
    });
    
    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

wss.on("error", (error) => {
    console.error("Server error:", error);
});