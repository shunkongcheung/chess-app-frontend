import { Board } from "../types";
import { Position } from "./types";
import { PositionStore } from "./PositionStore";

import getConnectedEmptyPositions from "./getConnectedEmptyPositions";
import getIsPieceFriendly from "./getIsPieceFriendly";
import getIsPieceOpponent from "./getIsPieceOpponent";
import getIsPositionInBound from "./getIsPositionInBound";

const getCannonNextPositions = (
  board: Board,
  piecePosition: Position
): PositionStore => {
  const directions: Array<Position> = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
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
    let tip =
      emptyPositions.end 
        ? emptyPositions.end.to
        : piecePosition;
    tip = [tip[0] + direction[0], tip[1] + direction[1]];

    /// if cannon target opponent.
    nextMoves.join(getCannonTarget(board, curPiece, direction, tip));
  });
  return nextMoves;
};

const getCannonTarget = (
  board: Board,
  oriPiece: string,
  dir: Position,
  tip: Position
): PositionStore => {
  const store = new PositionStore();
  let curPos: Position = [tip[0] + dir[0], tip[1] + dir[1]];

  while (getIsPositionInBound(curPos)) {
    const curPiece = board[curPos[0]][curPos[1]];
    if (getIsPieceFriendly(oriPiece, curPiece)) break;
    if (getIsPieceOpponent(oriPiece, curPiece)) {
      store.insert({ from: tip, to: curPos });
      break;
    }

    curPos = [curPos[0] + dir[0], curPos[1] + dir[1]];
  }

  return store;
};

export default getCannonNextPositions;
