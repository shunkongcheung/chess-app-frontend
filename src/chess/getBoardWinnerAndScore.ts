import { Board, Piece, Side } from "../types";
import getPieceScore from "./getPieceScore";

const getBoardWinnerAndScore = (board: Board): [Side, number] => {
  const winnerScore = 10000;
  let [total, isTGeneralExist, isBGeneralExist] = [0, false, false];

  board.map((row) => {
    row.map((piece) => {
      total += getPieceScore(piece);
      if (piece === Piece.GENERAL.toUpperCase()) isTGeneralExist = true;
      if (piece === Piece.GENERAL.toLowerCase()) isBGeneralExist = true;
    });
  });

  if (!isTGeneralExist) return [Side.Bottom, -winnerScore + total];
  if (!isBGeneralExist) return [Side.Top, winnerScore + total];

  return [Side.None, total];
};

export default getBoardWinnerAndScore;
