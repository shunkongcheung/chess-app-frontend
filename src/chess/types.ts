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
