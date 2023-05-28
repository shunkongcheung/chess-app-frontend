import { Piece, Side } from "../types";
import { ChessBoard, ChessNode } from "./types";

const getStrFromChessNode = ({piece, side }: ChessNode) => {
  if (piece === Piece.EMPTY) return piece;
  if (side === Side.Top) return piece.toUpperCase();
  return piece.toLowerCase();
}

const getHashFromBoard = (board: ChessBoard): string => board.map((row) => row.map(getStrFromChessNode).join("")).join("");
  
export default getHashFromBoard;
