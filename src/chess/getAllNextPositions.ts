import { Board, Move } from "../types";

import getFriendlyPiecePositions from "./getFriendlyPiecePositions";
import getPieceNextPositions from "./getPieceNextPositions";

const getAllNextPositions = (
  board: Board,
  isUpperSide: boolean
): Array<Move> => {
  const positions = getFriendlyPiecePositions(board, isUpperSide);

  let nextMoves: Array<Move> = [];
  positions.map((position) => {
    nextMoves = [
      ...nextMoves,
      ...getPieceNextPositions(board, position).map((to) => ({
        from: position,
        to,
      })),
    ];
  });
  return nextMoves;
};

export default getAllNextPositions;
