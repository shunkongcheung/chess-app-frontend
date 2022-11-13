import { Board, Position } from "../types";

import getIsPieceEmpty from "./getIsPieceEmpty";
import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getHorseNextPositions = (
  board: Board,
  piecePosition: Position
): Array<Position> => {
  const [left, right, top, bottom]: Array<Position> = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  const directions = [left, right, top, bottom];

  let nextMoves: Array<Position> = [];
  directions.map((direction) => {
    nextMoves = [
      ...nextMoves,
      ...getHorseNextPositionsOnDirection(board, direction, piecePosition),
    ];
  });
  return nextMoves;
};

const getHorseNextPositionsOnDirection = (
  board: Board,
  dir: Position,
  pos: Position
): Array<Position> => {
  if (!getIsHorseCheckPositionEmpty(board, dir, pos)) return [];

  const targetOne: Position = [
    pos[0] + (dir[0] ? dir[0] * 2 : -1),
    pos[1] + (dir[1] ? dir[1] * 2 : -1),
  ];
  const targetTwo: Position = [
    pos[0] + (dir[0] ? dir[0] * 2 : 1),
    pos[1] + (dir[1] ? dir[1] * 2 : 1),
  ];
  const curPiece = board[pos[0]][pos[1]];

  const nextPositions: Array<Position> = [];
  if (getIsHorseTargetSteppable(board, curPiece, targetOne))
    nextPositions.push(targetOne);

  if (getIsHorseTargetSteppable(board, curPiece, targetTwo))
    nextPositions.push(targetTwo);

  return nextPositions;
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
