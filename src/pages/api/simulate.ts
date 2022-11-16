import type { NextApiRequest, NextApiResponse } from "next";
import { getBoardWinnerAndScore, getHashFromBoard } from "../../chess";
import { DEFAULT_RUN_TIMES } from "../../constants";
import { nodeSorter, run } from "../../simulator";
import { Side, Board, Node } from "../../types";
import {
  NetworkNode,
  getNetworkNodeFromDataNode,
  getOpenSetFromNetworkOpenSet,
} from "../../utils/NetworkNode";

import { getOpenSetNetworkNodes, storeOpenSet } from "../../utils/Storage";

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
  board: Board;
}

export interface Result extends Params {
  total: number;
  timeTaken: number;
  pointer?: NetworkNode;
  openSet: Array<NetworkNode>;
  levelOneNodes: Array<NetworkNode>;
  nextNodes: Array<NetworkNode>;
}

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
    board,
  } = payload;

  const [winner, score] = getBoardWinnerAndScore(board);
  let openSet: Array<Node> = [
    {
      index: 0,
      board,
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

  const boardHash = getHashFromBoard(board);
  let remainRunTimes = runTimes;
  try {
    const existingData = await getOpenSetNetworkNodes(
      levelZeroSide,
      boardHash,
      remainRunTimes
    );
    console.log(
      `/api/simulate: data exists ${existingData.runTimes} -- ${remainRunTimes}`
    );
    if (existingData.runTimes <= remainRunTimes) {
      openSet = getOpenSetFromNetworkOpenSet(existingData.networkNodes);
      remainRunTimes -= existingData.runTimes;
      console.log(
        `/api/simulate: starter ${existingData.runTimes} -- ${remainRunTimes}`
      );
    }
  } catch {}

  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  const onHundredCallback = (idx: number, length: number) => {
    console.log(
      `/api/simulate: ${idx} -- ${performance.now() - startTime}ms -- ${length}`
    );
  };

  const startTime = performance.now();
  let result = run({
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    runTimes: remainRunTimes,
    onHundredCallback,
  });
  const endTime = performance.now();

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
    levelOneNodes: resultSet
      .filter((node) => node.level === 1)
      .sort(nodeSorter),
    timeTaken: Math.round(endTime - startTime),
  };

  const totalTime = performance.now() - startTime;
  console.log(
    `finished (${runTimes}}: ${totalTime}ms - ${result.openSet.length}`
  );

  res.status(200).json(response);

  if (isExport) {
    storeOpenSet(levelZeroSide, boardHash, result.openSet, runTimes);
    console.log("finish storage");
  }
}
