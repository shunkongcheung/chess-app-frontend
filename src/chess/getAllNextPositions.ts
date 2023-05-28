import { Board } from "../types";
import { Move, Position } from "./types";
import { PositionStore } from "./PositionStore";

import getFriendlyPiecePositions from "./getFriendlyPiecePositions";
import getPieceNextPositions from "./getPieceNextPositions";

const getAllNextPositions = (
  board: Board,
  isUpperSide: boolean
): Array<Move> => {
  const positionBoard = board.map((row, rowIdx) => row.map((_, colIdx) => [rowIdx, colIdx] as Position));
  const positions = getFriendlyPiecePositions(board, positionBoard, isUpperSide);

  const nextMoves = new PositionStore();
  positions.forEach((position) => nextMoves.join(getPieceNextPositions(board, positionBoard, position)));
  
  return nextMoves.asArray();
};

export default getAllNextPositions;
