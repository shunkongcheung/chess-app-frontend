import { Board, Piece } from "../types";

const getNonEmptyPieceCount = (board: Board) =>
  board.reduce(
    (prev, row) =>
      prev +
      row.reduce((prev, piece) => (prev + piece !== Piece.EMPTY ? 1 : 0), 0),
    0
  );

export default getNonEmptyPieceCount;
