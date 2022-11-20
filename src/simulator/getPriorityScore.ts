import { getAllNextPositions, getBoardWinnerAndScore } from "../chess";
import { Board, Piece, Side } from "../types";
import { PSEUDO_HIGH_PRIORITY } from "../constants";

interface Args {
  board: Board;
  level: number;
  score: number;
  levelZeroSide: Side;
  levelZeroScore: number;
}

const getIsCheckMate = (board: Board, isUpperSide: boolean) => {
  const moves = getAllNextPositions(board, isUpperSide);
  for (let idx = 0; idx < moves.length; idx++) {
    const { to } = moves[idx];
    const piece = board[to[0]][to[1]];
    if (piece.toUpperCase() === Piece.GENERAL.toUpperCase()) return true;
  }
  return false;
};

const getPriorityScore = ({
  board,
  level,
  score,
  levelZeroSide,
  levelZeroScore,
}: Args) => {
  // Example 1:
  // levelZeroSide = Top
  // levelOneSide = Bottom
  // on level one, highest value equals good score (i.e. to the front)
  //
  // Example 2:
  // levelZeroSide = Bottom
  // levelOneSide = Top
  // on level one, lowest value equal good score (i.e. to the front)

  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const nodeSide = level % 2 === 0 ? levelZeroSide : levelOneSide;

  const [winner] = getBoardWinnerAndScore(board);
  if (winner !== Side.None)
    return winner === nodeSide ? -PSEUDO_HIGH_PRIORITY : PSEUDO_HIGH_PRIORITY;

  // level = 2
  // levelZeroSide = Top
  // levelOneSide = Bottom
  // nodeSide = Top
  // isNodeSideUpper = true

  const isNodeSideUpper = nodeSide === Side.Top;
  if (getIsCheckMate(board, isNodeSideUpper)) return -PSEUDO_HIGH_PRIORITY;
  if (getIsCheckMate(board, !isNodeSideUpper)) return PSEUDO_HIGH_PRIORITY;

  return nodeSide === Side.Top
    ? levelZeroScore - score
    : score - levelZeroScore;
};

export default getPriorityScore;
