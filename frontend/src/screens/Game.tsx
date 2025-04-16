import { useEffect, useState } from "react"
import { Board } from "../Components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import '../index.css'
import { Chess } from "chess.js"

const INIT_GAME = "init-game"
const MOVE = 'move'
const GAME_OVER = 'game_over'

export const Game = () => {
    const socket = useSocket();
    const [chess] = useState(new Chess())
    const [board, setBoard] = useState(chess.board())
    const [gameStatus, setGameStatus] = useState("waiting")
    const [playerColor, setPlayerColor] = useState("")
    const [result, setResult] = useState<string | null>(null)
    const [winner, setWinner] = useState<string | null>(null)

    useEffect(() => {
        if (!socket) {
            return
        }

        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("Game component received message:", message);

            switch (message.type) {
                case "CONNECTION_ESTABLISHED":
                    console.log("Connected to server");
                    break;
                    
                case "WAITING_FOR_OPPONENT":
                    setGameStatus("waiting for opponent");
                    break;
                    
                case "INIT_GAME":
                    console.log("Game initialized with color:", message.payload.color);
                    setPlayerColor(message.payload.color);
                    setGameStatus("playing");
                    setBoard(chess.board());
                    break;
                    
                case MOVE:
                    console.log("Move received:", message.payload);
                    const moveData = message.payload.move || message.payload;
                    
                    try {
                        const result = chess.move({
                            from: moveData.from,
                            to: moveData.to
                        });
                        
                        if (result) {
                            console.log("Valid move made:", result);
                            
                            if (message.payload.board) {
                                chess.load(message.payload.board);
                            }
                            
                            setBoard([...chess.board()]);
                            
                            if (chess.isCheck() && !chess.isCheckmate()) {
                                setGameStatus(`${chess.turn() === 'w' ? 'White' : 'Black'} is in check!`);
                            } else {
                                setGameStatus("playing");
                            }
                        } else {
                            console.log("Invalid move received:", moveData);
                        }
                    } catch (error) {
                        console.error("Error making move:", error);
                    }
                    break;
                    
                case GAME_OVER:
                    const { result, winner, fen } = message.payload;
                    
                    if (fen) {
                        chess.load(fen);
                        setBoard([...chess.board()]);
                    }
                    
                    setResult(result);
                    setWinner(winner);
                    
                    if (result === "checkmate") {
                        setGameStatus(`Game over - Checkmate! ${winner} wins!`);
                    } else if (result === "stalemate") {
                        setGameStatus("Game over - Stalemate! It's a draw.");
                    } else if (result.includes("draw") || result.includes("repetition") || result.includes("insufficient")) {
                        setGameStatus(`Game over - ${result}! It's a draw.`);
                    }
                    break;
                    
                case "OPPONENT_DISCONNECTED":
                    setGameStatus("opponent disconnected");
                    break;
                    
                default:
                    console.log("Unknown message type:", message.type);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, chess]);

    const startGame = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                'type': INIT_GAME
            }));
            console.log("Sent init game message");
        } else {
            console.error("Socket not connected");
        }
    };

    const renderGameStatus = () => {
        if (gameStatus === "waiting") {
            return <div className="text-xl">Click "Play Now" to start a game</div>;
        } else if (gameStatus === "waiting for opponent") {
            return <div className="text-xl">Waiting for opponent to join...</div>;
        } else if (gameStatus.includes("Game over")) {
            return <div className="text-2xl font-bold text-red-600">{gameStatus}</div>;
        } else if (gameStatus.includes("check")) {
            return <div className="text-2xl font-bold text-yellow-600">{gameStatus}</div>;
        } else if (playerColor) {
            return <div className="text-lg">You are playing as: {playerColor}</div>;
        }
        return null;
    };

    if (!socket) {
        return <div className="text-center p-8 text-2xl">Connecting to server...</div>
    }

    return (
        <div className="h-full w-full p-4">
            <div className="text-center mb-4">
                {renderGameStatus()}
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className="w-full">
                    <Board 
                        chess={chess} 
                        setBoard={setBoard} 
                        socket={socket} 
                        board={board} 
                    />
                </div>
                <div className='flex w-50 justify-center gap-4 bg-black p-4'>
                    <div className="h-full flex flex-col justify-center">
                        <button 
                            className='w-32 h-12 bg-white text-black font-bold rounded'
                            onClick={startGame}
                            disabled={gameStatus !== "waiting" && !gameStatus.includes("Game over")}
                        >
                            Play Now!
                        </button>
                        
                        {result && (
                            <div className="mt-4 bg-white text-black p-4 rounded">
                                <h3 className="text-xl font-bold mb-2">Game Result</h3>
                                <p>Result: {result}</p>
                                {winner && <p>Winner: {winner}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}