import type { NextApiRequest, NextApiResponse } from "next";
import { getHashFromBoard } from "../../chess";
import { DEFAULT_MAXIMUM_LEVEL, DEFAULT_RUN_TIMES } from "../../constants";
import { nodeSorter, run } from "../../simulator";
import { Side } from "../../types";
import {
  NetworkNode,
  getOpenSetFromNetworkOpenSet,
  getNetworkNodeFromDataNode,
} from "../../utils/NetworkNode";

import { storeOpenSet } from "../../utils/Storage";

export interface Payload {
  pageNum?: number;
  pageSize?: number;
  isSorted?: boolean;
  isOpenOnly?: boolean;
  isExport?: boolean;
  runTimes?: number;
  levelZeroSide: Side;
  openSet: Array<NetworkNode>;
  maximumLevel?: number;
}

export interface Result {
  pageNum: number;
  pageSize: number;
  isSorted: boolean;
  isOpenOnly: boolean;
  runTimes: number;
  total: number;
  timeTaken: number;
  pointer?: NetworkNode;
  openSet: Array<NetworkNode>;
  levelOneNodes: Array<NetworkNode>;
  nextNodes: Array<NetworkNode>;
  maximumLevel: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = JSON.parse(req.body) as Payload;
  const {
    pageNum = 1,
    pageSize = 50,
    isSorted = false,
    isOpenOnly = false,
    isExport = false,
    runTimes = DEFAULT_RUN_TIMES,
    levelZeroSide,
    openSet: networkOpenSet,
    maximumLevel = DEFAULT_MAXIMUM_LEVEL,
  } = payload;

  const startTime = performance.now();
  const openSet = getOpenSetFromNetworkOpenSet(networkOpenSet);
  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  const onHundredCallback = (idx: number, length: number) => {
    console.log(`${idx}: ${performance.now() - startTime}ms - ${length}`);
  };
  let result = run({
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    maximumLevel,
    runTimes,
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
    isOpenOnly,
    isSorted,
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
    maximumLevel,
  };

  console.log(
    `finished (${runTimes}}: ${performance.now() - startTime}ms - ${
      result.openSet.length
    }`
  );
  res.status(200).json(response);

  if (isExport) {
    storeOpenSet(
      levelZeroSide,
      getHashFromBoard(levelZeroNode.board),
      result.openSet
    );
    console.log("finish storage");
  }
}
