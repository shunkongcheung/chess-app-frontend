import { Board } from "../types";
import { Position } from "./types";
import { PositionStore } from "./PositionStore";

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

  const store = new PositionStore();
  directions.map((direction) => store.join(getJumboNextPositionsOnDirection(board, direction, piecePosition)));
  return store;
};

const getJumboNextPositionsOnDirection = (
  board: Board,
  dir: Position,
  pos: Position
) => {
  const store = new PositionStore();
  if (!getIsJumboCheckPositionEmpty(board, dir, pos)) return store;

  const target: Position = [pos[0] + dir[0] * 2, pos[1] + dir[1] * 2];
  const curPiece = board[pos[0]][pos[1]];

  if (!getIsJumboTargetInBound(target, isUpper(curPiece))) return store;

  if (!getIsJumboTargetSteppable(board, curPiece, target)) return store;

  store.insert({ from: pos, to: target });
  return store;
};

const getIsJumboTargetInBound = (target: Position, isUpperSide: boolean) => {
  const top = isUpperSide ? 0 : 5;
  return getIsPositionInBound(target, { top, height: 5 });
};

const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

export default getJumboNextPositions;
