import { Side } from "../types";
import { ChessBoard, ChessNode, Position } from "./types";

import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getSoldierNextPositions = (board: ChessBoard, curPiece: ChessNode) => [
  ...getSoldierMarchPositions(board, curPiece),
  ...getSoldierSidePositions(board, curPiece),
];

const getIsSolderTargetSteppable = (
  curPiece: ChessNode,
  targetPiece: ChessNode
) => {
};

const getSoldierMarchPositions = (board: ChessBoard, curPiece: ChessNode) => {
  const marchStep = curPiece.side === Side.Top ? 1 : -1;
  const marchPos: Position = [curPiece.position[0] + marchStep, curPiece.position[1]];
  if (!getIsPositionInBound(marchPos)) return [];
  return !getIsPieceFriendly(curPiece, board[marchPos[0]][marchPos[1]]) ? [board[marchPos[0]][marchPos[1]]] : [];
};

const getSoldierSidePositions = (board: ChessBoard, curPiece: Position) => {
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
