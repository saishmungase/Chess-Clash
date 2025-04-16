"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
class Game {
    constructor(player1, player2) {
        this.countMove = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.player1.send(JSON.stringify({
            type: 'INIT_GAME',
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: 'INIT_GAME',
            payload: {
                color: "black"
            }
        }));
    }
    makeMove(socket, move) {
        if (this.countMove % 2 === 0 && socket !== this.player1) {
            console.log("Not player 1's turn");
            return;
        }
        if (this.countMove % 2 === 1 && socket !== this.player2) {
            console.log("Not player 2's turn");
            return;
        }
        if (this.countMove % 2 == 0) {
            console.log("Player 1 Move");
        }
        else {
            console.log("Player 2 Move");
        }
        try {
            this.board.move(move);
        }
        catch (e) {
            console.log("Invalid move:", e);
            return;
        }
        const moveMessage = JSON.stringify({
            type: message_1.MOVE,
            payload: {
                move: move,
                board: this.board.fen()
            }
        });
        this.player1.send(moveMessage);
        this.player2.send(moveMessage);
        this.countMove++;
        this.checkGameStatus();
    }
    checkGameStatus() {
        let gameStatus = null;
        let winner = null;
        if (this.board.isCheckmate()) {
            winner = this.countMove % 2 === 1 ? "white" : "black";
            gameStatus = "checkmate";
        }
        else if (this.board.isStalemate()) {
            gameStatus = "stalemate";
        }
        else if (this.board.isDraw()) {
            gameStatus = "draw";
        }
        else if (this.board.isInsufficientMaterial()) {
            gameStatus = "insufficient material";
        }
        else if (this.board.isThreefoldRepetition()) {
            gameStatus = "threefold repetition";
        }
        if (gameStatus) {
            const gameOverMessage = JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    result: gameStatus,
                    winner: winner,
                    fen: this.board.fen()
                }
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            console.log(`Game over: ${gameStatus}, Winner: ${winner || 'none'}`);
        }
    }
}
exports.Game = Game;
