import { Board } from "../types";
import { Move } from "./types";
import { PositionStore } from "./PositionStore";

import getFriendlyPiecePositions from "./getFriendlyPiecePositions";
import getPieceNextPositions from "./getPieceNextPositions";

const getAllNextPositions = (
  board: Board,
  isUpperSide: boolean
): Array<Move> => {
  const positions = getFriendlyPiecePositions(board, isUpperSide);

  const nextMoves = new PositionStore();
  positions.forEach((position) => nextMoves.join(getPieceNextPositions(board, position)));
  
  return nextMoves.asArray();
};

export default getAllNextPositions;
