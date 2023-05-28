import { Piece } from "../types";
import { ChessBoard, Position } from "./types";
import getCastleNextPositions from "./getCastlePositions";
import getCannonNextPositions from "./getCannonNextPositions";
import getGeneralNextPositions from "./getGeneralNextPositions";
import getHorseNextPositions from "./getHorseNextPositions";
import getJumboNextPositions from "./getJumboNextPositions";
import getKnightNextPositions from "./getKnightNextPositions";
import getSoldierNextPositions from "./getSoldierNextPositions";

type Callback = (board: ChessBoard, piecePosition: Position) => Array<Position>;

const getPieceNextPositions = (board: ChessBoard, piecePosition: Position) => {
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
  const [row, col] = piecePosition;
  const piecePrefix = board[row][col].piece;
  const pieceFunc = funcs[piecePrefix];

  return pieceFunc(board, piecePosition);
};

export default getPieceNextPositions;
