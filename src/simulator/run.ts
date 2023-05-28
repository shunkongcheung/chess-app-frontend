import { BoardNode, Side } from "../types";
import {
  getAllNextPositions,
  getBoardFromHash,
  getBoardWinnerAndScore,
  getHashFromBoard,
  getMovedBoard,
} from "../chess";

import getPriorityScore from "./getPriorityScore";
import nodeSorter from "./nodeSorter";
import DataStore from "./DataStore";
import { PSEUDO_HIGH_PRIORITY } from "../constants";

type CallbackRet = void | boolean;

interface Args {
  callbackInterval?: number;
  isAutoHandleL1: boolean;
  levelZeroScore: number;
  levelZeroSide: Side;
  openSet: Array<BoardNode>;
  onIntervalCallback?: (
    runIdx: number,
    dataStore: DataStore<BoardNode>,
    rest: Omit<Ret, "openSet">
  ) => CallbackRet | Promise<CallbackRet>;
  runTimes: number;
}

interface Ret {
  openSet: Array<BoardNode>;
  pointer?: BoardNode; // debug only
  nextNodes: Array<BoardNode>; // debug only
}

interface InternalArgs
  extends Omit<Args, "openSet" | "runTimes" | "isAutoHandleL1"> {
  openSetStore: DataStore<BoardNode>;
}

interface InternalRet extends Omit<Ret, "openSet"> {
  openSetStore: DataStore<BoardNode>;
}

const nodeFilter = (node: BoardNode) => !node.isTerminated && node.isOpenForCalculation;

const run = async ({
  isAutoHandleL1,
  callbackInterval = 1000,
  onIntervalCallback,
  openSet,
  runTimes,
  ...args
}: Args) => {
  if (runTimes <= 0) {
    return { openSet, nextNodes: [] };
  }

  const getKeyFromNode = (node: BoardNode) => {
    const boardHash = node.boardHash;
    return `${boardHash}_${node.level % 2}`;
  };

  const openSetStore = new DataStore<BoardNode>(
    getKeyFromNode,
    nodeSorter,
    nodeFilter,
    openSet
  );

  let ret = runHelper({ ...args, openSetStore });
  if (runTimes > 1) {
    // force all level 1 to be evaulate at least once
    const oneRunOpenSetArr = ret.openSetStore
      .asArray()
      .map((node) => {
        if (node.level === 1) {
          node.priority = PSEUDO_HIGH_PRIORITY;
        }
        return node;
      })
      .sort(nodeSorter);
    ret.openSetStore = new DataStore<BoardNode>(
      getKeyFromNode,
      nodeSorter,
      nodeFilter,
      oneRunOpenSetArr
    );
  }

  for (let idx = 1; idx < runTimes; idx++) {
    ret = runHelper({ ...args, openSetStore: ret.openSetStore });

    if (onIntervalCallback && idx % callbackInterval === 0) {
      const { openSetStore: debugStore, ...rest } = ret;
      const finish = await onIntervalCallback(idx, debugStore, rest);
      if (finish) {
        runTimes = idx;
        break;
      }
    }
  }

  // before returning, ensure no level 1 node is at PSEUDO_HIGH_PRIORITY
  // while (isAutoHandleL1 && getIsL1InPseudoPriority(ret.openSetStore.head)) {
  //   ret = runHelper({ ...args, openSetStore: ret.openSetStore });
  //   runTimes++;
  // }

  const { openSetStore: retOpenSetStore, ...rest } = ret;
  return { ...rest, openSet: retOpenSetStore.asArray() };
};

// const getIsL1InPseudoPriority = (head: LinkedListNode<BoardNode>): boolean => {
//   while (true) {
//     const { node } = head;
//     const isL1 = node.level === 1;
//     const isPseudoPriority =
//       !node.isTerminated && node.priority === PSEUDO_HIGH_PRIORITY;
//     if (isL1 && isPseudoPriority) return true;

//     if (head.next) head = head.next;
//     else return false;
//   }
// };

const runHelper = ({
  levelZeroScore,
  levelZeroSide,
  openSetStore,
}: InternalArgs): InternalRet => {
  const pointer = openSetStore.head;
  if (!pointer) {
    return { openSetStore, nextNodes: [] };
  }

  pointer.isOpenForCalculation = false;

  let nextNodes: Array<BoardNode> = pointer.children;
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const pointerSide = pointer.level % 2 === 0 ? levelZeroSide : levelOneSide;
  const isPointerSideTop = pointerSide === Side.Top;

  if (!pointer.children.length) {
    const pointerBoard = getBoardFromHash(pointer.boardHash);
    const nextMoves = getAllNextPositions(pointerBoard, isPointerSideTop);
    const nextBoards = nextMoves.map(({ from, to }) =>
      getMovedBoard(pointerBoard, from, to)
    );

    const level = pointer.level + 1;
    const setLength = openSetStore.length;

    let newNodeCount = 0;
    nextNodes = nextBoards
      .map((board) => {
        const [winner, score] = getBoardWinnerAndScore(board);
        const boardHash = getHashFromBoard(board);
        const node: BoardNode = {
          boardHash,
          level,
          score,
          winner,
          isTerminated: winner !== Side.None,
          index: -1,
          parent: pointer,
          priority: getPriorityScore({
            board,
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
    const isChanged = pointer.priority !== newPriority;

    if (isChanged && !!pointer.parent) {
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
    openSetStore.update(pointer);
  }

  return { openSetStore, pointer, nextNodes };
};

export default run;
