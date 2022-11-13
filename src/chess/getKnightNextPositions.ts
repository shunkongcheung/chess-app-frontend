import { Board, Position } from "../types";

import { getGeneralInBound as getKnightInBound } from "./getGeneralNextPositions";

import getIsPieceFriendly from "./getIsPieceFriendly";

const getKnightNextPositions = (board: Board, piecePosition: Position) => {
  const [bottom_left, bottom_right] = [
    [1, -1],
    [1, 1],
  ];
  const [top_left, top_right] = [
    [-1, -1],
    [-1, 1],
  ];
  const directions = [bottom_left, bottom_right, top_left, top_right];

  const curPiece = board[piecePosition[0]][piecePosition[1]];

  const nextMoves: Array<Position> = [];
  directions.map((direction) => {
    const nextPos: Position = [
      piecePosition[0] + direction[0],
      piecePosition[1] + direction[1],
    ];
    const isInBound = getKnightInBound(curPiece, nextPos);
    if (isInBound) {
      const nextPiece = board[nextPos[0]][nextPos[1]];
      if (!getIsPieceFriendly(curPiece, nextPiece)) nextMoves.push(nextPos);
    }
  });

  return nextMoves;
};

export default getKnightNextPositions;
