import type { NextApiRequest, NextApiResponse } from "next";
import { getBoardWinnerAndScore, getHashFromBoard } from "../../chess";
import { DEFAULT_RUN_TIMES } from "../../constants";
import { run } from "../../simulator";
import DbDataStore from "../../database/DbDataStore";
import { Side, Board, BoardNode } from "../../types";
import { getLogger } from "../../utils/Logger";
import { getCheckInfo } from "../../database/getCheckInfo";
import {
  getBoardNodeFromNetworkNode,
  NetworkNodeTable,
} from "../../database/NetworkNodeTable";
import { getSequelize } from "../../database/getSequelize";

interface Params {
  pageNum: number;
  pageSize: number;
  isSorted: boolean;
  isOpenOnly: boolean;
  runTimes: number;
}

export interface Payload extends Partial<Params> {
  levelZeroSide: Side;
  board: Board;
}

export interface Result extends Params {
  total: number;
  timeTaken: number;
  pointer?: BoardNode;
  openSet: Array<BoardNode>;
  nextNodes: Array<BoardNode>;
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
    runTimes = DEFAULT_RUN_TIMES,
    levelZeroSide,
    board,
  } = payload;
  const startTime = performance.now();
  const sequelize = await getSequelize();
  const [_, score] = getBoardWinnerAndScore(board);
  const boardHash = getHashFromBoard(board);
  let remainRunTimes = runTimes;

  const onIntervalCallback = async (idx: number, store: DbDataStore) => {
    const currentTime = Math.round(performance.now() - startTime);
    const count = await store.count();
    logger(
      `Running. ${idx}/${remainRunTimes}. ${currentTime}(ms)/${count}(nodes)`
    );
  };

  let pointerId: number = -1;
  try {
    const preRunCheckInfo = await getCheckInfo(levelZeroSide, boardHash, 0);
    pointerId = preRunCheckInfo.highestPriorityNode?.index;
  } catch {}

  const store = await run({
    levelZeroScore: score,
    levelZeroSide,
    levelZeroBoardHash: boardHash,
    runTimes: remainRunTimes,
    onIntervalCallback,
  });

  const hasPrevPointer = pointerId >= 0;

  const { recordId, currentNode: pointerNode } = await getCheckInfo(
    levelZeroSide,
    boardHash,
    hasPrevPointer ? pointerId : 0
  );
  const query = await NetworkNodeTable.findAll({
    where: { recordId },
    order: [isSorted ? ["priority", "desc"] : ["index", "asc"]],
    offset: (pageNum - 1) * pageSize,
    limit: pageSize,
  });

  const total = await NetworkNodeTable.count({
    where: { recordId },
  });

  const timeTaken = Math.round(performance.now() - startTime);

  let pointer: BoardNode | undefined = undefined;
  if (hasPrevPointer) {
    pointer = {
      ...pointerNode,
      parent: pointerNode.parent?.index || -1,
      children: pointerNode.children.map((node) => node.index),
    };
  }
  const nextNodes = await (pointer ? store.getNodes(pointer.children) : []);

  const response: Result = {
    pageNum,
    pageSize,
    isSorted,
    isOpenOnly,
    runTimes,
    total,
    pointer,
    openSet: query.map(getBoardNodeFromNetworkNode),
    nextNodes,
    timeTaken,
  };

  logger(`finished. ${timeTaken}(ms)/${total}(nodes)/${remainRunTimes}(times)`);

  await sequelize.close();
  res.status(200).json(response);
}
