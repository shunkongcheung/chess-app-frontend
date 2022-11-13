import { Board, Position } from "../types";

import getConnectedEmptyPositions from "./getConnectedEmptyPositions";
import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPieceOpponent from "./getIsPieceOpponent";
import getIsPositionInBound from "./getIsPositionInBound";

const getCannonNextPositions = (
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
    // all empty positions
    const emptyPositions = getConnectedEmptyPositions(
      board,
      piecePosition,
      direction
    );
    nextMoves = [...nextMoves, ...emptyPositions];

    // get tip of this direction
    let tip =
      emptyPositions.length > 0
        ? emptyPositions[emptyPositions.length - 1]
        : piecePosition;
    tip = [tip[0] + direction[0], tip[1] + direction[1]];

    /// if cannon target opponent.
    nextMoves = [
      ...nextMoves,
      ...getCannonTarget(board, curPiece, direction, tip),
    ];
  });
  return nextMoves;
};

const getCannonTarget = (
  board: Board,
  oriPiece: string,
  dir: Position,
  tip: Position
): Array<Position> => {
  let curPos: Position = [tip[0] + dir[0], tip[1] + dir[1]];

  while (getIsPositionInBound(curPos)) {
    const curPiece = board[curPos[0]][curPos[1]];
    if (getIsPieceFriendly(oriPiece, curPiece)) break;
    if (getIsPieceOpponent(oriPiece, curPiece)) return [curPos];

    curPos = [curPos[0] + dir[0], curPos[1] + dir[1]];
  }

  return [];
};

export default getCannonNextPositions;
