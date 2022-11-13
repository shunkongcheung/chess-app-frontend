import { Board, Position } from "../types";

import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getSoldierNextPositions = (board: Board, piecePosition: Position) => [
  ...getSoldierMarchPositions(board, piecePosition),
  ...getSoldierSidePositions(board, piecePosition),
];

const getIsSolderTargetSteppable = (
  board: Board,
  curPiece: string,
  targetPos: Position
) => {
  if (!getIsPositionInBound(targetPos)) return false;

  const targetPiece = board[targetPos[0]][targetPos[1]];
  return !getIsPieceFriendly(curPiece, targetPiece);
};

const getSoldierMarchPositions = (board: Board, piecePos: Position) => {
  const curPiece = board[piecePos[0]][piecePos[1]];
  const marchStep = isUpper(curPiece) ? 1 : -1;
  const marchPos: Position = [piecePos[0] + marchStep, piecePos[1]];

  if (!getIsSolderTargetSteppable(board, curPiece, marchPos)) return [];

  return [marchPos];
};

const getSoldierSidePositions = (board: Board, piecePos: Position) => {
  const curPiece = board[piecePos[0]][piecePos[1]];
  let isSideable = false;

  if (isUpper(curPiece) && piecePos[0] > 4) isSideable = true;

  if (!isUpper(curPiece) && piecePos[0] < 5) isSideable = true;

  if (!isSideable) return [];

  const leftPos: Position = [piecePos[0], piecePos[1] - 1];
  const rightPost: Position = [piecePos[0], piecePos[1] + 1];
  const sidePositions = [];

  if (getIsSolderTargetSteppable(board, curPiece, leftPos))
    sidePositions.push(leftPos);

  if (getIsSolderTargetSteppable(board, curPiece, rightPost))
    sidePositions.push(rightPost);

  return sidePositions;
};
const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

export default getSoldierNextPositions;
