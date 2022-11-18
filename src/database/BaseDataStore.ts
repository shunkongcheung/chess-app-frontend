import { Op } from "sequelize";
import { getBoardFromHash, getBoardWinnerAndScore } from "../chess";
import { PSEUDO_HIGH_PRIORITY } from "../constants";
import { BoardNode, Side } from "../types";

import { ExportRecordTable } from "./ExportRecordTable";
import { NetworkNodeTable } from "./NetworkNodeTable";

export interface DataStore {
  initialize: (boardHash: string, side: Side) => Promise<number>;
  record: (runTimes: number) => Promise<void>;
  count: () => Promise<number>;
  getNode: (boardNode: BoardNode) => Promise<BoardNode | undefined>;
  getNodeById: (index: number) => Promise<BoardNode | undefined>;
  getNodes: (indexes: Array<number>) => Promise<Array<BoardNode>>;
  head: () => Promise<BoardNode | undefined>;
  insert: (boardNode: BoardNode) => Promise<void>;
  update: (index: number, boardNode: Partial<BoardNode>) => Promise<void>;
}

export const getNetworkNodeFromBoardNode = (
  recordId: number,
  boardNode: Partial<BoardNode>
) => {
  const ret: { [x: string]: any } = { ...boardNode, recordId };
  if (!Number.isNaN(ret.level)) ret.isEvenLevel = ret.level % 2 === 0;
  if (boardNode.relatives) ret.relatives = JSON.stringify(ret.relatives);
  if (boardNode.children) ret.children = JSON.stringify(ret.children);
  return ret;
};

export const initialize = async (boardHash: string, side: Side) => {
  const [exportRecordTeble, isCreated] = await ExportRecordTable.findOrCreate({
    where: { boardHash, side },
    defaults: {
      boardHash,
      side,
      runTimes: 0,
      total: 0,
      highestPriorityNodeIndex: 0,
      maxReachedNodeIndex: 0,
    },
  });

  const recordId = exportRecordTeble.id;

  if (isCreated) {
    const [winner, score] = getBoardWinnerAndScore(getBoardFromHash(boardHash));
    const createInfo = {
      boardHash,
      index: 0,
      level: 0,
      score,
      winner,
      parent: -1,
      priority: 0,
      isOpenForCalculation: true,
      isTerminated: false,
      relatives: [],
      children: [],
    };
    await NetworkNodeTable.create(
      getNetworkNodeFromBoardNode(recordId, createInfo)
    );
  }

  return { runTimes: exportRecordTeble.runTimes, recordId };
};

export const record = async (recordId: number, runTimes: number) => {
  const [maxReachedNode, highestPriorityNode, total] = await Promise.all([
    NetworkNodeTable.findAll({
      where: { recordId },
      order: [["level", "desc"]],
      limit: 1,
    }),
    NetworkNodeTable.findAll({
      where: {
        recordId,
        priority: { [Op.ne]: PSEUDO_HIGH_PRIORITY },
      },
      order: [["priority", "desc"]],
      limit: 1,
    }),
    NetworkNodeTable.count({ where: { recordId } }),
  ]);

  await ExportRecordTable.update(
    {
      maxReachedNodeIndex: maxReachedNode[0]?.index || 0,
      highestPriorityNodeIndex: highestPriorityNode[0]?.index || 0,
      runTimes,
      total,
    },
    { where: { id: recordId } }
  );
};
