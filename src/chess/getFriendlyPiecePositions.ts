import { Board, Piece } from "../types";
import { Position } from "./types";

import getIsPieceFriendly from "./getIsPieceFriendly";

const getFriendlyPiecePositions = (
  board: Board,
  isUpperSide: boolean
): Array<Position> => {
  const friendlyPositions: Array<Position> = [];

  const myPiece = isUpperSide
    ? Piece.GENERAL.toUpperCase()
    : Piece.GENERAL.toLowerCase();

  board.map((row, rowIdx) => {
    row.map((piecePrefix, colIdx) => {
      if (getIsPieceFriendly(myPiece, piecePrefix))
        friendlyPositions.push([rowIdx, colIdx]);
    });
  });

  return friendlyPositions;
};

export default getFriendlyPiecePositions;
