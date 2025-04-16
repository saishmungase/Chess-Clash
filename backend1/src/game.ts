import WebSocket from 'ws';
import { Chess } from 'chess.js';
import { GAME_OVER, MOVE } from "./message";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public countMove = 0;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
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

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string
    }) {

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
        } else {
            console.log("Player 2 Move");
        }

        try {
            this.board.move(move);
        } catch (e) {
            console.log("Invalid move:", e);
            return;
        }

        const moveMessage = JSON.stringify({
            type: MOVE,
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
                type: GAME_OVER,
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