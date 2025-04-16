import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState, useEffect } from "react";

export const Board = ({ chess, board, socket }: {
    chess: Chess;
    setBoard: (board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][]) => void;
    board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
    socket: WebSocket;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const [playerColor, setPlayerColor] = useState<Color | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            
            if (message.type === 'INIT_GAME') {
                setPlayerColor(message.payload.color);
                setIsGameOver(false);
                console.log(`You are playing as ${message.payload.color}`);
            }
            
            if (message.type === 'GAME_OVER') {
                setIsGameOver(true);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket]);

    const handleSquareClick = (squareRepresent: Square) => {
        if (isGameOver) return;
        
        if (!from) {
            const piece = chess.get(squareRepresent);
            
            if (piece && (!playerColor || piece.color === playerColor.charAt(0) as Color)) {
                setFrom(squareRepresent);
                console.log("Selected piece at:", squareRepresent);
            }
        } else {
            console.log(`Attempting move from ${from} to ${squareRepresent}`);
            
            socket.send(JSON.stringify({
                type: 'move',  
                payload: {
                    move: {
                        from: from.toLowerCase(),
                        to: squareRepresent.toLowerCase()
                    }
                }
            }));
            
            setFrom(null);
        }
    };

    const getPieceImage = (square: { type: PieceSymbol; color: Color } | null) => {
        if (!square) return null;
        
        const pieceColor = square.color === 'w' ? 'white' : 'black';
        
        const pieceTypeMap: Record<PieceSymbol, string> = {
            'p': 'pawn',
            'n': 'knight',
            'b': 'bishop',
            'r': 'rook',
            'q': 'queen',
            'k': 'king'
        };
        
        const pieceType = pieceTypeMap[square.type];
        const imageSrc = `/${pieceColor}-${pieceType}.png`;
        
        return (
            <img 
                src={imageSrc} 
                alt={`${pieceColor} ${pieceType}`}
                className="w-12 h-12 object-contain"
            />
        );
    };
    
    const isSquareInCheck = (squareRepresent: Square) => {
        const piece = chess.get(squareRepresent);
        return piece && 
               piece.type === 'k' && 
               chess.isCheck() &&
               ((piece.color === 'w' && chess.turn() === 'w') || 
                (piece.color === 'b' && chess.turn() === 'b'));
    };

    return (
        <div className="">
            {board.map((row, i) => (
                <div key={i} className="flex">
                    {row.map((square, j) => {
                        const squareRepresent = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                        const isSelected = from === squareRepresent;
                        const inCheck = isSquareInCheck(squareRepresent);

                        return (
                            <div
                                onClick={() => handleSquareClick(squareRepresent)}
                                key={j}
                                className={`
                                    w-16 h-16 
                                    ${isSelected ? 'border-4 border-yellow-400' : ''}
                                    ${inCheck ? 'bg-red-400' : (i + j) % 2 === 0 ? 'bg-green-500' : 'bg-white'}
                                    ${isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <div className="h-full flex justify-center items-center">
                                    {getPieceImage(square)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};