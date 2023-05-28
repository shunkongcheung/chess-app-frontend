import { Board } from "../types";
import { Position, PositionBoard } from "./types";
import { PositionStore } from "./PositionStore";

import getIsPieceEmpty from "./getIsPieceEmpty";
import getIsPositionInBound from "./getIsPositionInBound";

type Direction = [number, number];

const getConnectedEmptyPositions = (
  board: Board,
  positionBoard: PositionBoard,
  curPosition: Position,
  direction: Direction
): PositionStore => {

  let nextPosition: Position = [
    curPosition[0] + direction[0],
    curPosition[1] + direction[1],
  ];

  const store = new PositionStore();

  const height = board.length;
  const width = height > 0 ? board[0].length : 0;

  while (getIsPositionInBound(nextPosition, { width, height })) {
    if (getIsPieceEmpty(board[nextPosition[0]][nextPosition[1]])) {
      store.insert({ from: curPosition, to: positionBoard[nextPosition[0]][nextPosition[1]] });

      nextPosition = [
        nextPosition[0] + direction[0],
        nextPosition[1] + direction[1],
      ];
    } else break;
  }
  return store;
};
export default getConnectedEmptyPositions;
