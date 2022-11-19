import { Board, Piece } from "../types";
import { Position } from "./types";

import getIsPieceEmpty from "./getIsPieceEmpty";
import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPositionInBound from "./getIsPositionInBound";

const getGeneralNextPositions = (
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
  const curPiece = board[piecePosition[0]][piecePosition[1]];

  let nextMoves: Array<Position> = [];
  directions.map((direction) => {
    const nextPos: Position = [
      piecePosition[0] + direction[0],
      piecePosition[1] + direction[1],
    ];
    const isInBound = getGeneralInBound(curPiece, nextPos);
    if (isInBound) {
      const nextPiece = board[nextPos[0]][nextPos[1]];
      if (!getIsPieceFriendly(curPiece, nextPiece)) nextMoves.push(nextPos);
    }
  });

  return [...nextMoves, ...getGeneralFlyPosition(board, piecePosition)];
};

const getGeneralFlyPosition = (
  board: Board,
  piecePosition: Position
): Array<Position> => {
  const curPiece = board[piecePosition[0]][piecePosition[1]];
  const rowStep = isUpper(curPiece) ? 1 : -1;

  // fly until hitting anything on board
  let curPos: Position = [piecePosition[0] + rowStep, piecePosition[1]];
  while (
    getIsPositionInBound(curPos) &&
    getIsPieceEmpty(board[curPos[0]][curPos[1]])
  ) {
    curPos = [curPos[0] + rowStep, curPos[1]];
  }

  if (!getIsPositionInBound(curPos)) return [];

  // must hit another general
  if (board[curPos[0]][curPos[1]].toUpperCase() !== Piece.GENERAL.toUpperCase())
    return [];

  // must hit the opponent's general
  if (isUpper(board[curPos[0]][curPos[1]]) === isUpper(curPiece)) return [];

  // fly to opponent's general
  return [curPos];
};

export const getGeneralInBound = (
  curPiece: string,
  nextPosition: Position
): boolean => {
  const [left, width, height] = [3, 3, 3];
  const top = isUpper(curPiece) ? 0 : 7;

  return getIsPositionInBound(nextPosition, { left, top, width, height });
};

const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

export default getGeneralNextPositions;
