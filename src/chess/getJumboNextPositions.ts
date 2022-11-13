import { Board, Position } from "../types";

import {
  getIsHorseCheckPositionEmpty as getIsJumboCheckPositionEmpty,
  getIsHorseTargetSteppable as getIsJumboTargetSteppable,
} from "./getHorseNextPositions";

import getIsPositionInBound from "./getIsPositionInBound";

const getJumboNextPositions = (board: Board, piecePosition: Position) => {
  const directions: Array<Position> = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  let nextMoves: Array<Position> = [];
  directions.map((direction) => {
    nextMoves = [
      ...nextMoves,
      ...getJumboNextPositionsOnDirection(board, direction, piecePosition),
    ];
  });
  return nextMoves;
};

const getJumboNextPositionsOnDirection = (
  board: Board,
  dir: Position,
  pos: Position
) => {
  if (!getIsJumboCheckPositionEmpty(board, dir, pos)) return [];

  const target: Position = [pos[0] + dir[0] * 2, pos[1] + dir[1] * 2];
  const curPiece = board[pos[0]][pos[1]];

  if (!getIsJumboTargetInBound(target, isUpper(curPiece))) return [];

  if (!getIsJumboTargetSteppable(board, curPiece, target)) return [];

  return [target];
};

const getIsJumboTargetInBound = (target: Position, isUpperSide: boolean) => {
  const top = isUpperSide ? 0 : 5;
  return getIsPositionInBound(target, { top, height: 5 });
};

const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

export default getJumboNextPositions;
