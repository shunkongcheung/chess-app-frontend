export type Position = [number, number];

export type PositionBoard = Array<Array<Position>>;

export interface Move {
  from: Position;
  to: Position;
}

export enum BoardPieceCount {
  LtOneThird,
  LtTwoThird,
  GteTwoThird,
}
