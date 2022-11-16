import type { NextApiRequest, NextApiResponse } from "next";
import { getBoardWinnerAndScore, getHashFromBoard } from "../../chess";
import { DEFAULT_MAXIMUM_LEVEL, DEFAULT_RUN_TIMES } from "../../constants";
import { nodeSorter, run } from "../../simulator";
import { Side, Board } from "../../types";
import {
  NetworkNode,
  getNetworkNodeFromDataNode,
} from "../../utils/NetworkNode";

import { storeOpenSet } from "../../utils/Storage";

interface Params {
  pageNum: number;
  pageSize: number;
  isSorted: boolean;
  isOpenOnly: boolean;
  isExport: boolean;
  runTimes: number;
  maximumLevel: number;
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
    board,
    maximumLevel = DEFAULT_MAXIMUM_LEVEL,
  } = payload;

  const [winner, score] = getBoardWinnerAndScore(board);
  const openSet = [
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
  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  const onHundredCallback = (idx: number, length: number) => {
    console.log(`${idx}: ${performance.now() - startTime}ms - ${length}`);
  };

  const startTime = performance.now();
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
    isSorted,
    isOpenOnly,
    isExport,
    runTimes,
    maximumLevel,
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
    storeOpenSet(
      levelZeroSide,
      getHashFromBoard(levelZeroNode.board),
      result.openSet,
      maximumLevel,
      runTimes
    );
    console.log("finish storage");
  }
}
