import { Piece, Board } from "../types";
import { Position } from "./types";

const getMovedBoard = (board: Board, from: Position, to: Position) => {
  const newBoard = JSON.parse(JSON.stringify(board));
  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = Piece.EMPTY;

  return newBoard;
};

export default getMovedBoard;
