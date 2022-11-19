import { Board } from "../types";
import { Position } from "./types";

import getConnectedEmptyPositions from "./getConnectedEmptyPositions";
import getIsPieceOpponent from "./getIsPieceOpponent";
import getIsPositionInBound from "./getIsPositionInBound";

const getCastleNextPositions = (
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
    let tip = emptyPositions.length
      ? emptyPositions[emptyPositions.length - 1]
      : piecePosition;
    tip = [tip[0] + direction[0], tip[1] + direction[1]];

    // if tip is an opponent.
    if (getIsPositionInBound(tip)) {
      const tipPiece = board[tip[0]][tip[1]];
      if (getIsPieceOpponent(curPiece, tipPiece)) nextMoves.push(tip);
    }
  });

  return nextMoves;
};

export default getCastleNextPositions;
