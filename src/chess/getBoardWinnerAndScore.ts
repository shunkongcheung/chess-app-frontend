import { Board, Piece, Side } from "../types";

import { ONE_THIRD_PIECE_COUNT, TOTAL_PIECE_COUNT } from "./constants";

import getPieceScore from "./getPieceScore";
import getNonEmptyPieceCount from "./getNonEmptyPieceCount";
import { BoardPieceCount } from "./types";


const TOP_SOLIDER_ROW_INDEX = 3;
const BOT_SOLIDER_ROW_INDEX = 6;
const MID_COLUMN_INDEX = 4;

const getBoardWinnerAndScore = (board: Board): [Side, number] => {
  const winnerScore = 10000;
  let [total, isTGeneralExist, isBGeneralExist] = [0, false, false];
  const count = getNonEmptyPieceCount(board);
  let countState = BoardPieceCount.GteTwoThird;

  if (count < ONE_THIRD_PIECE_COUNT * 1) {
    countState = BoardPieceCount.LtOneThird;
  }else if (count < ONE_THIRD_PIECE_COUNT * 2) {
    countState = BoardPieceCount.LtTwoThird;
  }

  let positional = 0;
  board.map((row, rowIndex) => {
    row.map((piece, colIndex) => {
      total += getPieceScore(piece, countState);

      if (countState === BoardPieceCount.GteTwoThird && piece !== Piece.EMPTY) {
        const isUpperPiece = piece === piece.toUpperCase();

        const distanceFromStarter = isUpperPiece ? 
          BOT_SOLIDER_ROW_INDEX - rowIndex 
        : rowIndex - TOP_SOLIDER_ROW_INDEX;

        const distanceFromMiddle = Math.abs(colIndex - MID_COLUMN_INDEX)
        
        if(distanceFromStarter > 0) {
          const loggedValue = Math.log(Math.abs(distanceFromStarter));
          positional += (isUpperPiece ? -loggedValue : loggedValue) / TOTAL_PIECE_COUNT;
        }

        if(distanceFromMiddle > 0) {
          const loggedValue = Math.log(Math.abs(distanceFromMiddle));
          positional += (isUpperPiece ? -loggedValue : loggedValue) / TOTAL_PIECE_COUNT;
        }
      }

      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;

      if (piece === Piece.GENERAL.toUpperCase()) isTGeneralExist = true;
      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;
    });
  });

  if(Math.abs(positional) > 0.001){
    total += positional;
  }


  if (!isTGeneralExist) return [Side.Bottom, -winnerScore + total];
  if (!isBGeneralExist) return [Side.Top, winnerScore + total];

  return [Side.None, total];
};

export default getBoardWinnerAndScore;
