import { Node, Side } from "../types";
import {
  getAllNextPositions,
  getBoardWinnerAndScore,
  getHashFromBoard,
  getMovedBoard,
} from "../chess";

import getIsNodeTerminated from "./getIsNodeTerminated";
import getPriorityScore from "./getPriorityScore";
import nodeSorter from "./nodeSorter";

interface Args {
  levelZeroSide: Side;
  openSet: Array<Node>;
  maximumLevel: number;
}

interface Ret {
  openSet: Array<Node>;
  pointer?: Node; // debug only
  nextNodes: Array<Node>; // debug only
}

const getPointer = (openSet: Array<Node>): Node | undefined => {
  const copied: Array<Node> = [...openSet];
  copied.sort(nodeSorter);
  return copied.find((node) => !node.isTerminated && node.isOpenForCalculation);
};

const run = ({ levelZeroSide, openSet, maximumLevel }: Args): Ret => {
  const pointer = getPointer(openSet);
  if (!pointer) {
    return { openSet, nextNodes: [] };
  }

  pointer.isOpenForCalculation = false;

  let nextNodes: Array<Node> = pointer.children;
  const levelZeroScore = openSet[0].score;
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const pointerSide = pointer.level % 2 === 0 ? levelZeroSide : levelOneSide;
  const isPointerSideTop = pointerSide === Side.Top;

  if (!pointer.children.length) {
    const nextMoves = getAllNextPositions(pointer.board, isPointerSideTop);
    const nextBoards = nextMoves.map(({ from, to }) =>
      getMovedBoard(pointer.board, from, to)
    );

    const level = pointer.level + 1;
    const existingBoardHashs = openSet.map((node) =>
      getHashFromBoard(node.board)
    );

    nextNodes = nextBoards
      .map((board) => {
        const [winner, score] = getBoardWinnerAndScore(board);
        const node: Node = {
          board,
          level,
          score,
          winner,
          isTerminated: winner !== Side.None,
          parent: pointer,
          priority: getPriorityScore({
            level,
            score,
            levelZeroSide,
            levelZeroScore,
          }),
          children: [],
          isOpenForCalculation: true,
        };
        return node;
      })
      .filter(
        (node) =>
          !existingBoardHashs.find(
            (boardHash) => boardHash === getHashFromBoard(node.board)
          )
      );

    // update parent's children
    pointer.children = nextNodes;
    openSet = openSet.concat(nextNodes);

    if (!nextNodes.length) {
      pointer.isTerminated = true;
    }
  }

  if (pointer.children.length) {
    const childrenPriorities = pointer.children.map((node) => node.priority);
    const newPriority = -Math.max(...childrenPriorities);

    if (
      (pointer.priority !== newPriority || pointer.winner !== Side.None) &&
      !!pointer.parent
    ) {
      pointer.parent.isOpenForCalculation = true;
      pointer.parent.priority = Math.max(pointer.parent.priority, -newPriority);
    }

    pointer.priority = newPriority;
    pointer.isTerminated = getIsNodeTerminated(pointer, maximumLevel);
  }

  return { openSet, pointer, nextNodes };
};

export default run;
