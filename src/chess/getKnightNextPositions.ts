import { Board } from "../types";
import { Position, PositionBoard } from "./types";
import { PositionStore } from "./PositionStore";

import { getGeneralInBound as getKnightInBound } from "./getGeneralNextPositions";

import getIsPieceFriendly from "./getIsPieceFriendly";

const getKnightNextPositions = (board: Board, positionBoard: PositionBoard, piecePosition: Position) => {
  const [bottomLeft, bottomRight] = [
    [1, -1],
    [1, 1],
  ];
  const [topLeft, topRight] = [
    [-1, -1],
    [-1, 1],
  ];
  const directions = [bottomLeft, bottomRight, topLeft, topRight];

  const curPiece = board[piecePosition[0]][piecePosition[1]];

  const store = new PositionStore();
  directions.map((direction) => {
    const nextPos: Position = [
      piecePosition[0] + direction[0],
      piecePosition[1] + direction[1],
    ];
    const isInBound = getKnightInBound(curPiece, nextPos);
    if (isInBound) {
      const nextPiece = board[nextPos[0]][nextPos[1]];
      if (!getIsPieceFriendly(curPiece, nextPiece)) store.insert({ from: piecePosition, to: positionBoard[nextPos[0]][nextPos[1]] });
    }
  });

  return store;
};

export default getKnightNextPositions;
