import { Board } from "../types";
import { Position, PositionBoard } from "./types";
import { PositionStore } from "./PositionStore";

import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getSoldierNextPositions = (board: Board, positionBoard: PositionBoard, piecePosition: Position) => 
  getSoldierMarchPositions(board, positionBoard, piecePosition).join(getSoldierSidePositions(board, positionBoard, piecePosition));

const getIsSolderTargetSteppable = (
  board: Board,
  curPiece: string,
  targetPos: Position
) => {
  if (!getIsPositionInBound(targetPos)) return false;

  const targetPiece = board[targetPos[0]][targetPos[1]];
  return !getIsPieceFriendly(curPiece, targetPiece);
};

const getSoldierMarchPositions = (board: Board, positionBoard: PositionBoard, piecePos: Position) => {
  const store = new PositionStore();
  const curPiece = board[piecePos[0]][piecePos[1]];
  const marchStep = isUpper(curPiece) ? 1 : -1;
  const marchPos: Position = [piecePos[0] + marchStep, piecePos[1]];

  if (!getIsSolderTargetSteppable(board, curPiece, marchPos)) return store;

  store.insert({ from: piecePos, to: positionBoard[marchPos[0]][marchPos[1]] });
  return store;
};

const getSoldierSidePositions = (board: Board, positionBoard: PositionBoard, piecePos: Position) => {
  const store = new PositionStore();
  const curPiece = board[piecePos[0]][piecePos[1]];
  let isSideable = false;

  if (isUpper(curPiece) && piecePos[0] > 4) isSideable = true;

  if (!isUpper(curPiece) && piecePos[0] < 5) isSideable = true;

  if (!isSideable) return store;

  const leftPos: Position = [piecePos[0], piecePos[1] - 1];
  const rightPos: Position = [piecePos[0], piecePos[1] + 1];

  if (getIsSolderTargetSteppable(board, curPiece, leftPos))
    store.insert({ from: piecePos, to: positionBoard[leftPos[0]][leftPos[1]] });

  if (getIsSolderTargetSteppable(board, curPiece, rightPos))
    store.insert({ from: piecePos, to: positionBoard[rightPos[0]][rightPos[1]]  });

  return store;
};
const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

export default getSoldierNextPositions;
