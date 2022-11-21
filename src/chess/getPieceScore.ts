import { Piece } from "../types";
import { BoardPieceCount } from "./types";

const SOLIDER_SCORE = 2;
const LOW_MULTIPLIER = 2;
const MIDDLE_MULTIPLIER = 4;
const TOP_MULTIPLIER = 5;

const PIECE_STANDARD_SCORES: Record<Piece, number> = {
  [Piece.EMPTY]: 0,
  [Piece.SOLDIER]: SOLIDER_SCORE,
  [Piece.JUMBO]: SOLIDER_SCORE * LOW_MULTIPLIER,
  [Piece.KNIGHT]: SOLIDER_SCORE * LOW_MULTIPLIER,
  [Piece.CANNON]: SOLIDER_SCORE * MIDDLE_MULTIPLIER,
  [Piece.HORSE]: SOLIDER_SCORE * MIDDLE_MULTIPLIER,
  [Piece.CASTLE]: SOLIDER_SCORE * TOP_MULTIPLIER,
  [Piece.GENERAL]: SOLIDER_SCORE, // doesnt matter
};

const getPieceScore = (piecePrefix: string, countState: BoardPieceCount) => {
  const piecePrefixUpper = piecePrefix.toUpperCase() as Piece;

  let cannonScore = SOLIDER_SCORE * MIDDLE_MULTIPLIER;
  let horseScore = SOLIDER_SCORE * MIDDLE_MULTIPLIER;

  if (countState === BoardPieceCount.GteTwoThird) {
    cannonScore = SOLIDER_SCORE * TOP_MULTIPLIER;
  }
  if (countState === BoardPieceCount.LtOneThird) {
    horseScore = SOLIDER_SCORE * TOP_MULTIPLIER;
  }

  const pieceScore = {
    ...PIECE_STANDARD_SCORES,
    [Piece.CANNON]: cannonScore,
    [Piece.HORSE]: horseScore,
  };

  const value = pieceScore[piecePrefixUpper];
  return piecePrefixUpper === piecePrefix ? value : -value;
};

export default getPieceScore;
