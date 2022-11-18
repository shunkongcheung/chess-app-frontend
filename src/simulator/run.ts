import { BoardNode, Side } from "../types";
import {
  getAllNextPositions,
  getBoardFromHash,
  getBoardWinnerAndScore,
  getHashFromBoard,
  getMovedBoard,
} from "../chess";

import getPriorityScore from "./getPriorityScore";
// import Store from "../database/DbDataStore";
import Store from "../database/InMemoryDataStore";
import { PSEUDO_HIGH_PRIORITY } from "../constants";

interface Args {
  levelZeroBoardHash: string;
  levelZeroScore: number;
  levelZeroSide: Side;
  runTimes: number;
  callbackInterval?: number;
  onIntervalCallback?: (runIdx: number, dataStore: Store) => any;
}

interface InternalArgs {
  levelZeroScore: number;
  levelZeroSide: Side;
  openSetStore: Store;
}

const run = async ({
  callbackInterval = 1000,
  onIntervalCallback,
  levelZeroBoardHash,
  levelZeroScore,
  levelZeroSide,
  runTimes,
}: Args) => {
  const openSetStore = new Store();
  const oldRunTimes = await openSetStore.initialize(
    levelZeroBoardHash,
    levelZeroSide
  );

  for (let idx = oldRunTimes; idx < runTimes; idx++) {
    runHelper({ levelZeroSide, levelZeroScore, openSetStore });

    if (onIntervalCallback && idx % callbackInterval === 0) {
      await Promise.all([
        onIntervalCallback(idx, openSetStore),
        openSetStore.record(idx),
      ]);
    }
  }
  await openSetStore.record(Math.max(runTimes, oldRunTimes));
  return openSetStore;
};

const runHelper = ({
  levelZeroScore,
  levelZeroSide,
  openSetStore,
}: InternalArgs) => {
  const pointer = openSetStore.head();

  if (!pointer) {
    return;
  }

  pointer.isOpenForCalculation = false;

  let nextNodes: Array<number> = pointer.children;
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const pointerSide = pointer.level % 2 === 0 ? levelZeroSide : levelOneSide;
  const isPointerSideTop = pointerSide === Side.Top;

  if (!pointer.children.length) {
    const board = getBoardFromHash(pointer.boardHash);
    const nextMoves = getAllNextPositions(board, isPointerSideTop);
    const nextBoards = nextMoves.map(({ from, to }) =>
      getMovedBoard(board, from, to)
    );

    const level = pointer.level + 1;
    const setLength = openSetStore.count();

    nextNodes = [];
    const potentialNextNodes = nextBoards.map((board) => {
      const [winner, score] = getBoardWinnerAndScore(board);
      const node: BoardNode = {
        boardHash: getHashFromBoard(board),
        level,
        score,
        winner,
        isTerminated: winner !== Side.None,
        index: -1,
        parent: pointer.index,
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
    });

    let newNodeCount = 0;
    for (let idx = 0; idx < potentialNextNodes.length; idx++) {
      const potentialNode = potentialNextNodes[idx];
      const existingNode = openSetStore.getNode(potentialNode);
      if (existingNode) {
        existingNode.relatives.push(pointer.index);
        nextNodes.push(existingNode.index);
      } else {
        potentialNode.index = setLength + newNodeCount;
        newNodeCount += 1;
        openSetStore.insert(potentialNode);
        nextNodes.push(potentialNode.index);
      }
    }

    // update parent's children
    pointer.children = nextNodes;
  }

  if (!pointer.children.length) {
    pointer.isTerminated = true;
  }
  if (pointer.children.length) {
    const childrenBoardNodes = openSetStore.getChildren(pointer);
    const childrenPriorities = childrenBoardNodes.map((node) => node!.priority);
    const newPriority = -Math.max(...childrenPriorities);
    const isPriorityChanged = pointer.priority !== newPriority;

    if (isPriorityChanged && pointer.parent >= 0) {
      // if my score has changed, parent needs to re-eveluate, force it to the
      // front such that it would be picked up on next iteration.
      const parent = openSetStore.getNodeById(pointer.parent);
      parent.isOpenForCalculation = true;
      parent.priority = PSEUDO_HIGH_PRIORITY;

      openSetStore.update(pointer.parent, parent);

      for (let idx = 0; idx < pointer.relatives.length; idx++) {
        const relative = pointer.relatives[idx];
        openSetStore.update(relative, { isOpenForCalculation: true });
      }
    }

    pointer.priority = newPriority;
  }
  openSetStore.update(pointer.index, pointer);

  return { openSetStore };
};

export default run;
