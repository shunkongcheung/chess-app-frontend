import { Piece, Side } from "../types";

export type Position = [number, number];

export interface Move {
  from: Position;
  to: Position;
}

export enum BoardPieceCount {
  LtOneThird,
  LtTwoThird,
  GteTwoThird,
}

export interface ChessNode {
  position: Position;
  piece : Piece;
  side: Side;
}

export type ChessBoard = Array<Array<ChessNode>>;
