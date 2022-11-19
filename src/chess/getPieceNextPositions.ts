import { Board, Piece } from "../types";
import { Position } from "./types";
import getCastleNextPositions from "./getCastlePositions";
import getCannonNextPositions from "./getCannonNextPositions";
import getGeneralNextPositions from "./getGeneralNextPositions";
import getHorseNextPositions from "./getHorseNextPositions";
import getJumboNextPositions from "./getJumboNextPositions";
import getKnightNextPositions from "./getKnightNextPositions";
import getSoldierNextPositions from "./getSoldierNextPositions";

type Callback = (board: Board, piecePosition: Position) => Array<Position>;

const getPieceNextPositions = (board: Board, piecePosition: Position) => {
  const funcs: Record<Piece, Callback> = {
    [Piece.EMPTY]: getCastleNextPositions,
    [Piece.CASTLE]: getCastleNextPositions,
    [Piece.CANNON]: getCannonNextPositions,
    [Piece.GENERAL]: getGeneralNextPositions,
    [Piece.HORSE]: getHorseNextPositions,
    [Piece.JUMBO]: getJumboNextPositions,
    [Piece.KNIGHT]: getKnightNextPositions,
    [Piece.SOLDIER]: getSoldierNextPositions,
  };
  const piecePrefix = board[piecePosition[0]][
    piecePosition[1]
  ].toUpperCase() as Piece;
  const pieceFunc = funcs[piecePrefix];

  return pieceFunc(board, piecePosition);
};

export default getPieceNextPositions;
