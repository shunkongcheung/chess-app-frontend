import { Board } from "../types";
import { Position } from "./types";
import { PositionStore } from "./PositionStore";

import getConnectedEmptyPositions from "./getConnectedEmptyPositions";
import getIsPieceOpponent from "./getIsPieceOpponent";
import getIsPositionInBound from "./getIsPositionInBound";

const getCastleNextPositions = (
  board: Board,
  piecePosition: Position
): PositionStore => {
  const [left, right, top, bottom]: Array<Position> = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  const directions = [left, right, top, bottom];
  const curPiece = board[piecePosition[0]][piecePosition[1]];

  const nextMoves = new PositionStore();

  directions.map((direction) => {
    // all empty positions
    const emptyPositions = getConnectedEmptyPositions(
      board,
      piecePosition,
      direction
    );
    nextMoves.join(emptyPositions);

    // get tip of this direction
    let tip = emptyPositions.end
      ? emptyPositions.end.to
      : piecePosition;

    tip = [tip[0] + direction[0], tip[1] + direction[1]];

    // if tip is an opponent.
    if (getIsPositionInBound(tip)) {
      const tipPiece = board[tip[0]][tip[1]];
      if (getIsPieceOpponent(curPiece, tipPiece)) nextMoves.insert({ from: piecePosition, to: tip });
    }
  });

  return nextMoves;
};

export default getCastleNextPositions;
