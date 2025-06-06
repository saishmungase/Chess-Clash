"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const game_1 = require("./game");
const message_1 = require("./message");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.messageHandle(socket);
        socket.send(JSON.stringify({
            type: "CONNECTION_ESTABLISHED",
            payload: {
                message: "Connected to server"
            }
        }));
        console.log("Total Number of Users => " + this.users.length);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (game) {
            const otherPlayer = game.player1 === socket ? game.player2 : game.player1;
            otherPlayer.send(JSON.stringify({
                type: "OPPONENT_DISCONNECTED",
                payload: {
                    message: "Your opponent has disconnected"
                }
            }));
            this.games = this.games.filter(g => g !== game);
        }
    }
    messageHandle(socket) {
        socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log("Received message:", message);
                if (message.type === message_1.INIT_GAME || message.type === "init_game" || message.type === "init-game") {
                    console.log("Init game request received");
                    if (this.pendingUser && this.pendingUser !== socket) {
                        console.log("Found pending user, creating new game");
                        const game = new game_1.Game(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                        console.log("Game has started with two players");
                    }
                    else {
                        console.log("No pending user, adding current user to pending");
                        this.pendingUser = socket;
                        socket.send(JSON.stringify({
                            type: "WAITING_FOR_OPPONENT",
                            payload: {
                                message: "Waiting for another player to join"
                            }
                        }));
                    }
                }
                else if (message.type === message_1.MOVE) {
                    console.log("Move received:", message.payload);
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        const moveData = message.payload.move || message.payload;
                        game.makeMove(socket, moveData);
                    }
                    else {
                        console.log("Game not found for this socket");
                        socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: {
                                message: "You are not in an active game"
                            }
                        }));
                    }
                }
            }
            catch (error) {
                console.error("Error processing message:", error);
                socket.send(JSON.stringify({
                    type: "ERROR",
                    payload: {
                        message: "Error processing your request: " + error
                    }
                }));
            }
        });
    }
}
exports.GameManager = GameManager;
