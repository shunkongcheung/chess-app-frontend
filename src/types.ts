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
  Top = "top",
  Bottom = "bottom",
  None = "none",
}

export interface Move {
  from: Position;
  to: Position;
}

export interface BoardNode {
  board: Board;
  // order that the node is inserted
  index: number;
  // level 0: start board
  // level 1: all possible options by starter
  // caller shall feed at least from level one
  level: number;
  // high score flavor top side, low score flavor bottom side.
  score: number;
  // used for sorting which item to node to choose as next pointer
  priority: number;
  // record exists if any side won
  winner: Side;
  // whether node should be considered when chosing next pointer
  isOpenForCalculation: boolean;
  // whether termination condition is reached
  isTerminated: boolean;
  // connection nodes: the one that generate current node
  parent?: BoardNode;
  // connection nodes: not the one generate current node, but can also generate current node
  relatives: Array<BoardNode>;
  // connection nodes
  children: Array<BoardNode>;
}
