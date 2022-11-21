import type { NextApiRequest, NextApiResponse } from "next";
import { getBoardWinnerAndScore, getBoardFromHash } from "../../chess";
import { DEFAULT_RUN_TIMES } from "../../constants";
import { nodeSorter, run } from "../../simulator";
import DataStore from "../../simulator/DataStore";
import { Side, BoardNode } from "../../types";
import { getLogger } from "../../utils/Logger";
import {
  NetworkNode,
  getNetworkNodeFromDataNode,
} from "../../utils/NetworkNode";

import { storeOpenSet } from "../../database/storeOpenSet";

interface Params {
  pageNum: number;
  pageSize: number;
  isAutoHandleL1: boolean;
  isSorted: boolean;
  isOpenOnly: boolean;
  isExport: boolean;
  runTimes: number;
}

export interface Payload extends Partial<Params> {
  levelZeroSide: Side;
  boardHash: string;
}

export interface Result extends Params {
  total: number;
  timeTaken: number;
  pointer?: NetworkNode;
  openSet: Array<NetworkNode>;
  levelOneNodes: Array<NetworkNode>;
  nextNodes: Array<NetworkNode>;
}

const logger = getLogger("/api/simulate");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = JSON.parse(req.body) as Payload;
  const {
    pageNum = 1,
    pageSize = 50,
    isAutoHandleL1 = true,
    isSorted = false,
    isOpenOnly = false,
    isExport = false,
    runTimes = DEFAULT_RUN_TIMES,
    levelZeroSide,
    boardHash,
  } = payload;
  const startTime = performance.now();
  const board = getBoardFromHash(boardHash);
  const [winner, score] = getBoardWinnerAndScore(board);
  let openSet: Array<BoardNode> = [
    {
      index: 0,
      boardHash,
      level: 0,
      score,
      winner,
      isTerminated: false,
      priority: 0,
      relatives: [],
      children: [],
      isOpenForCalculation: true,
    },
  ];

  let remainRunTimes = runTimes;
  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  let prevIndexes: Array<number> = [];
  const onIntervalCallback = async (
    idx: number,
    store: DataStore<BoardNode>
  ) => {
    const openSet = store.asArray();
    const COMPARE_COUNT = 5;
    if (isExport) {
      await storeOpenSet(levelZeroSide, boardHash, openSet, runTimes);
    }

    const currentTime = Math.round(performance.now() - startTime);
    const levelOneNodeIndexes = openSet
      .filter((boardNode) => boardNode.level === 1)
      .map((boardNode) => boardNode.index);

    const levelOneNodeIdxJoin = levelOneNodeIndexes.join(",");
    const msg = `${idx}/${remainRunTimes}. ${currentTime}(ms)/${store.length}(nodes): ${levelOneNodeIdxJoin}`;
    logger(msg);

    const isFinished =
      !!prevIndexes.length &&
      levelOneNodeIndexes
        .slice(0, COMPARE_COUNT)
        .reduce(
          (prev, curr, index) => prev && curr === prevIndexes[index],
          true
        );

    prevIndexes = levelOneNodeIndexes;

    return !isExport && isFinished;
  };

  const currentTime = Math.round(performance.now() - startTime);
  logger(`${remainRunTimes}. ${currentTime}(ms)`);
  let result = await run({
    isAutoHandleL1,
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    runTimes: remainRunTimes,
    callbackInterval: Math.floor(remainRunTimes / 5),
    onIntervalCallback,
  });

  let resultSet = result.openSet.map(getNetworkNodeFromDataNode);
  if (!isSorted) {
    resultSet.sort((a, b) => {
      if (a.index < b.index) return -1;
      if (a.index > b.index) return 1;
      return 0;
    });
  }

  if (isOpenOnly) {
    resultSet = resultSet.filter(
      (item) => item.isOpenForCalculation && !item.isTerminated
    );
  }

  const timeTaken = Math.round(performance.now() - startTime);
  const response: Result = {
    pageNum,
    pageSize,
    isAutoHandleL1,
    isSorted,
    isOpenOnly,
    isExport,
    runTimes,
    total: result.openSet.length,
    pointer: result.pointer
      ? getNetworkNodeFromDataNode(result.pointer)
      : undefined,
    openSet: resultSet.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    nextNodes: result.nextNodes
      .sort(nodeSorter)
      .map(getNetworkNodeFromDataNode),
    levelOneNodes: result.openSet
      .filter((node) => node.level === 1)
      .map(getNetworkNodeFromDataNode),
    timeTaken,
  };

  const levelOneNodeIndexes = result.openSet
    .filter((node) => node.level === 1)
    .map((boardNode) => boardNode.index)
    .join(", ");

  logger(
    `finished. ${remainRunTimes}(times)/${timeTaken}(ms)/${result.openSet.length}(nodes). ${levelOneNodeIndexes}`
  );

  res.status(200).json(response);

  if (isExport) {
    await storeOpenSet(levelZeroSide, boardHash, result.openSet, runTimes);
    logger("stored.");
  }
}
