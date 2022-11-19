import { Board, Piece, Side } from "../types";

import { TOTAL_PIECE_COUNT } from "./constants";

import getBoardPieceState from "./getBoardPieceState";
import getPieceScore from "./getPieceScore";
import { BoardPieceCount } from "./types";

const TOP_SOLIDER_ROW_INDEX = 3;
const BOT_SOLIDER_ROW_INDEX = 6;
const MID_COLUMN_INDEX = 4;

const getBoardWinnerAndScore = (board: Board): [Side, number] => {
  const winnerScore = 10000;
  let [total, isTGeneralExist, isBGeneralExist] = [0, false, false];

  let positional = 0;
  board.map((row, rowIndex) => {
    row.map((piece, colIndex) => {
      const countState = getBoardPieceState(board);
      total += getPieceScore(piece, countState);

      if (countState === BoardPieceCount.GteTwoThird && piece !== Piece.EMPTY) {
        const isUpperPiece = piece === piece.toUpperCase();

        const distanceFromStarter = isUpperPiece
          ? BOT_SOLIDER_ROW_INDEX - rowIndex
          : rowIndex - TOP_SOLIDER_ROW_INDEX;

        const distanceFromMiddle = Math.abs(colIndex - MID_COLUMN_INDEX);

        if (distanceFromStarter >= 0) {
          const loggedValue =
            distanceFromStarter === 0
              ? 0
              : Math.log(Math.abs(distanceFromStarter));
          positional +=
            (isUpperPiece ? -loggedValue : loggedValue) / TOTAL_PIECE_COUNT;
        }

        if (distanceFromMiddle >= 0) {
          const loggedValue =
            distanceFromMiddle === 0
              ? 0
              : Math.log(Math.abs(distanceFromMiddle));
          positional +=
            (isUpperPiece ? -loggedValue : loggedValue) / TOTAL_PIECE_COUNT;
        }
      }

      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;

      if (piece === Piece.GENERAL.toUpperCase()) isTGeneralExist = true;
      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;
    });
  });

  if (Math.abs(positional) > 0.001) {
    total += positional;
  }

  if (!isTGeneralExist) return [Side.Bottom, -winnerScore + total];
  if (!isBGeneralExist) return [Side.Top, winnerScore + total];

  return [Side.None, total];
};

export default getBoardWinnerAndScore;
