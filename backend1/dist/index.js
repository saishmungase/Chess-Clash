"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const gameManager_1 = require("./gameManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new gameManager_1.GameManager();
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
