import { Board, Piece } from "../types";
import { Position } from "./types";
import { PositionStore } from "./PositionStore";

import getIsPieceFriendly from "./getIsPieceFriendly";

const getFriendlyPiecePositions = (
  board: Board,
  isUpperSide: boolean
): PositionStore<Position> => {
  const friendlyPositions = new PositionStore<Position>();

  const myPiece = isUpperSide
    ? Piece.GENERAL.toUpperCase()
    : Piece.GENERAL.toLowerCase();

  board.map((row, rowIdx) => {
    row.map((piecePrefix, colIdx) => {
      if (getIsPieceFriendly(myPiece, piecePrefix)){
        friendlyPositions.insert([rowIdx, colIdx]);
      }
    });
  });

  return friendlyPositions;
};

export default getFriendlyPiecePositions;
