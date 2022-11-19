import { Board, Piece, Side } from "../types";

import { ONE_THIRD_PIECE_COUNT } from "./constants";
import getPieceScore from "./getPieceScore";
import getNonEmptyPieceCount from "./getNonEmptyPieceCount";
import { BoardPieceCount } from "./types";

const getBoardWinnerAndScore = (board: Board): [Side, number] => {
  const winnerScore = 10000;
  let [total, isTGeneralExist, isBGeneralExist] = [0, false, false];
  const count = getNonEmptyPieceCount(board);
  let countState = BoardPieceCount.LtOneThird;

  if (count >= ONE_THIRD_PIECE_COUNT * 2) {
    countState = BoardPieceCount.GteTwoThird;
  }
  if (count >= ONE_THIRD_PIECE_COUNT * 2) {
    countState = BoardPieceCount.LtTwoThird;
  }

  board.map((row) => {
    row.map((piece) => {
      total += getPieceScore(piece, countState);
      if (piece === Piece.GENERAL.toUpperCase()) isTGeneralExist = true;
      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;
    });
  });

  if (!isTGeneralExist) return [Side.Bottom, -winnerScore + total];
  if (!isBGeneralExist) return [Side.Top, winnerScore + total];

  return [Side.None, total];
};

export default getBoardWinnerAndScore;
