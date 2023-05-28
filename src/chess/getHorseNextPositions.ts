import { Board } from "../types";
import { Position, PositionBoard } from "./types";
import { PositionStore } from "./PositionStore";

import getIsPieceEmpty from "./getIsPieceEmpty";
import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getHorseNextPositions = (
  board: Board,
  positionBoard: PositionBoard,
  piecePosition: Position
): PositionStore => {
  const directions: Array<Position> = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  const nextMoves = new PositionStore();
  directions.map((direction) =>  nextMoves.join(getHorseNextPositionsOnDirection(board, positionBoard, direction, piecePosition)));
  return nextMoves;
};

const getHorseNextPositionsOnDirection = (
  board: Board,
  positionBoard: PositionBoard,
  dir: Position,
  pos: Position
): PositionStore => {
  const store = new PositionStore();
  if (!getIsHorseCheckPositionEmpty(board, dir, pos)) return store;

  const targetOne: Position = [
    pos[0] + (dir[0] ? dir[0] * 2 : -1),
    pos[1] + (dir[1] ? dir[1] * 2 : -1),
  ];
  const targetTwo: Position = [
    pos[0] + (dir[0] ? dir[0] * 2 : 1),
    pos[1] + (dir[1] ? dir[1] * 2 : 1),
  ];
  const curPiece = board[pos[0]][pos[1]];

  if (getIsHorseTargetSteppable(board, curPiece, targetOne))
    store.insert({ from: pos, to: positionBoard[targetOne[0]][targetOne[1]] });

  if (getIsHorseTargetSteppable(board, curPiece, targetTwo))
    store.insert({ from: pos, to: positionBoard[targetTwo[0]][targetTwo[1]] });

  return store;
};

export const getIsHorseCheckPositionEmpty = (
  board: Board,
  dir: Position,
  pos: Position
): boolean => {
  const checkPos: Position = [pos[0] + dir[0], pos[1] + dir[1]];
  if (!getIsPositionInBound(checkPos)) return false;

  const checkPiece = board[checkPos[0]][checkPos[1]];
  return getIsPieceEmpty(checkPiece);
};

export const getIsHorseTargetSteppable = (
  board: Board,
  curPiece: string,
  targetPos: Position
): boolean => {
  if (!getIsPositionInBound(targetPos)) return false;

  const targetPiece = board[targetPos[0]][targetPos[1]];
  return !getIsPieceFriendly(curPiece, targetPiece);
};

export default getHorseNextPositions;
