export type Board = Array<Array<string>>;

export enum Piece {
  EMPTY = "_",
  CANNON = "A",
  CASTLE = "C",
  GENERAL = "G",
  HORSE = "H",
  JUMBO = "J",
  KNIGHT = "K",
  SOLDIER = "S",
}

export type Position = [number, number];

export enum Side {
  Top,
  Bottom,
  None,
}

export interface Move {
  from: Position;
  to: Position;
}
