import { Side } from "../types";
import { ChessBoard, Position } from "./types";

const getFriendlyPiecePositions = (
  board: ChessBoard,
  isUpperSide: boolean
): Array<Position> => {
  return board.map(row => row.filter(({ side }) => {
    const nodeIsUpper = side === Side.Top;
    return nodeIsUpper === isUpperSide;
  }))
  .flat()
  .map(({ position }) => position);
};

export default getFriendlyPiecePositions;
