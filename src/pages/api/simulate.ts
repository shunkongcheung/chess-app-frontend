import type { NextApiRequest, NextApiResponse } from "next";
import { getBoardWinnerAndScore, getBoardFromHash } from "../../chess";
import { DEFAULT_RUN_TIMES } from "../../constants";
import { run } from "../../simulator";
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
  // try {
  //   const existingData = await getOpenSetNetworkNodes(
  //     levelZeroSide,
  //     boardHash,
  //     remainRunTimes
  //   );
  //   logger(`Exists. ${existingData.runTimes}/${remainRunTimes}`);

  //   if (existingData.runTimes <= remainRunTimes) {
  //     remainRunTimes -= existingData.runTimes;
  //     openSet = getOpenSetFromNetworkOpenSet(existingData.networkNodes);
  //     const currentTime = Math.round(performance.now() - startTime);
  //     logger(`Generated. ${currentTime}`);
  //   }
  // } catch {}

  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  const onIntervalCallback = async (
    idx: number,
    store: DataStore<BoardNode>
  ) => {
    if (isExport) {
      const openSet = store.asArray();
      await storeOpenSet(levelZeroSide, boardHash, openSet, runTimes);
    }
    const currentTime = Math.round(performance.now() - startTime);
    logger(
      `Running. ${idx}/${remainRunTimes}. ${currentTime}(ms)/${store.length}(nodes)`
    );
  };

  let result = await run({
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    runTimes: remainRunTimes,
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
    isSorted,
    isOpenOnly,
    isExport,
    runTimes,
    total: result.openSet.length,
    pointer: result.pointer
      ? getNetworkNodeFromDataNode(result.pointer)
      : undefined,
    openSet: resultSet.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    nextNodes: result.nextNodes.map(getNetworkNodeFromDataNode),
    levelOneNodes: result.openSet
      .filter((node) => node.level === 1)
      .map(getNetworkNodeFromDataNode),
    timeTaken,
  };

  logger(
    `finished. ${remainRunTimes}(times)/${timeTaken}(ms)/${result.openSet.length}(nodes)`
  );

  res.status(200).json(response);

  if (isExport) {
    await storeOpenSet(levelZeroSide, boardHash, result.openSet, runTimes);
    logger("stored.");
  }
}
