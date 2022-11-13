import { Board, Position } from "../types";

import getIsPieceEmpty from "./getIsPieceEmpty";
import getIsPositionInBound from "./getIsPositionInBound";

type Direction = [number, number];

const getConnectedEmptyPositions = (
  board: Board,
  curPosition: Position,
  direction: Direction
): Array<Position> => {
  let nextPosition: Position = [
    curPosition[0] + direction[0],
    curPosition[1] + direction[1],
  ];
  const emptyPositions: Array<Position> = [];

  const height = board.length;
  const width = height > 0 ? board[0].length : 0;

  while (getIsPositionInBound(nextPosition, { width, height })) {
    if (getIsPieceEmpty(board[nextPosition[0]][nextPosition[1]])) {
      emptyPositions.push(nextPosition);
      nextPosition = [
        nextPosition[0] + direction[0],
        nextPosition[1] + direction[1],
      ];
    } else break;
  }
  return emptyPositions;
};
export default getConnectedEmptyPositions;
