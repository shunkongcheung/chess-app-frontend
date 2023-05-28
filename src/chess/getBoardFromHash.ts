import { Piece, Side } from "../types"
import { ChessBoard, Position } from "./types";

const isUpper = (char: string) => char == char.toUpperCase() && char != char.toLowerCase();

const getIsPieceEmpty = (piece: string): boolean => piece == Piece.EMPTY;

const getBoardFromHash = (boardHash: string): ChessBoard => {
  const [HEIGHT, WIDTH] = [10, 9];
  const board: ChessBoard = [];

  for (let rowIdx = 0; rowIdx < HEIGHT; rowIdx++) {
    const rowInStr = boardHash.slice(rowIdx * WIDTH, (rowIdx + 1) * WIDTH).split("");

    const row = rowInStr.map((piece, colIdx) => {
      const position: Position = [rowIdx, colIdx];
      if(getIsPieceEmpty(piece)) return { position, side: Side.None, piece: Piece.EMPTY };
      return { position, side: isUpper(piece) ? Side.Top : Side.Bottom, piece: piece.toUpperCase() as Piece };
    });

    board.push(row);
  }

  return board;
};

export default getBoardFromHash;
