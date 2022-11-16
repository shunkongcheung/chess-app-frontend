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
import DataStore, { LinkedListNode } from "./DataStore";
import { PSEUDO_HIGH_PRIORITY } from "../constants";

interface Args {
  levelZeroScore: number;
  levelZeroSide: Side;
  openSet: Array<Node>;
  maximumLevel: number;
  runTimes: number;
  onHundredCallback?: (runIdx: number, count: number) => any;
}

interface Ret {
  openSet: Array<Node>;
  pointer?: Node; // debug only
  nextNodes: Array<Node>; // debug only
}

interface InternalArgs extends Omit<Args, "openSet" | "runTimes"> {
  openSetStore: DataStore<Node>;
}

interface InternalRet extends Omit<Ret, "openSet"> {
  openSetStore: DataStore<Node>;
}

const run = ({ onHundredCallback, openSet, runTimes, ...args }: Args) => {
  if (runTimes <= 0) {
    return { openSet, nextNodes: [] };
  }

  const getKeyFromNode = (node: Node) => {
    const boardHash = getHashFromBoard(node.board);
    return `${boardHash}_${node.level % 2}`;
  };

  const openSetStore = new DataStore<Node>(getKeyFromNode, nodeSorter, openSet);

  let ret = runHelper({ ...args, openSetStore });
  for (let idx = 1; idx < runTimes; idx++) {
    ret = runHelper({ ...args, openSetStore: ret.openSetStore });

    if (onHundredCallback && idx % 100 === 0) {
      onHundredCallback(idx, ret.openSetStore.length);
    }
  }

  // before returning, ensure no level 1 node is at PSEUDO_HIGH_PRIORITY
  // const finalPointer = getPointer(openSetStore.head);
  // if(finalPointer && finalPointer.level === 1 && finalPointer.priority === PSEUDO_HIGH_PRIORITY) {
  //   ret = runHelper({ ...args, openSetStore: ret.openSetStore });
  // }

  const { openSetStore: retOpenSetStore, ...rest } = ret;
  return { ...rest, openSet: retOpenSetStore.asArray() };
};

const getPointer = (head: LinkedListNode<Node>): Node | undefined => {
  while (true) {
    if (!head.node.isTerminated && head.node.isOpenForCalculation)
      return head.node;
    if (head.next) head = head.next;
    else return undefined;
  }
};

const runHelper = ({
  levelZeroScore,
  levelZeroSide,
  openSetStore,
  maximumLevel,
}: InternalArgs): InternalRet => {
  const pointer = getPointer(openSetStore.head);
  if (!pointer) {
    return { openSetStore, nextNodes: [] };
  }

  pointer.isOpenForCalculation = false;

  let nextNodes: Array<Node> = pointer.children;
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const pointerSide = pointer.level % 2 === 0 ? levelZeroSide : levelOneSide;
  const isPointerSideTop = pointerSide === Side.Top;

  if (!pointer.children.length) {
    const nextMoves = getAllNextPositions(pointer.board, isPointerSideTop);
    const nextBoards = nextMoves.map(({ from, to }) =>
      getMovedBoard(pointer.board, from, to)
    );

    const level = pointer.level + 1;
    const isNextNodeAtMaxLevel = level > maximumLevel;
    const setLength = openSetStore.length;

    let newNodeCount = 0;
    nextNodes = nextBoards
      .map((board) => {
        const [winner, score] = getBoardWinnerAndScore(board);
        const node: Node = {
          board,
          level,
          score,
          winner,
          isTerminated: isNextNodeAtMaxLevel || winner !== Side.None,
          index: -1,
          parent: pointer,
          priority: getPriorityScore({
            level,
            score,
            levelZeroSide,
            levelZeroScore,
          }),
          relatives: [],
          children: [],
          isOpenForCalculation: true,
        };
        return node;
      })
      .map((node) => {
        const existingNode = openSetStore.getNode(node);
        if (existingNode) {
          existingNode.relatives.push(pointer);
          return existingNode;
        }
        node.index = setLength + newNodeCount;
        newNodeCount += 1;
        openSetStore.insert(node);
        return node;
      });

    // update parent's children
    pointer.children = nextNodes;
  }

  if (!pointer.children.length) {
    pointer.isTerminated = true;
  }
  if (pointer.children.length) {
    const childrenPriorities = pointer.children.map((node) => node.priority);
    const newPriority = -Math.max(...childrenPriorities);

    if (pointer.priority !== newPriority && !!pointer.parent) {
      // if my score has changed, parent needs to re-eveluate, force it to the
      // front such that it would be picked up on next iteration.
      pointer.parent.isOpenForCalculation = true;
      pointer.parent.priority = PSEUDO_HIGH_PRIORITY;
      openSetStore.update(pointer.parent);

      pointer.relatives.map((relative) => {
        relative.isOpenForCalculation = true;
        // relative.priority = PSEUDO_HIGH_PRIORITY;
        // openSetStore.update(relative);
      });
    }

    pointer.priority = newPriority;
    pointer.isTerminated = getIsNodeTerminated(pointer, maximumLevel);
    openSetStore.update(pointer);
  }

  return { openSetStore, pointer, nextNodes };
};

export default run;
