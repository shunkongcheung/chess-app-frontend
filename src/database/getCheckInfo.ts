import { WhereOptions } from "sequelize";

import { Side } from "../types";
import { NetworkNode } from "../utils/NetworkNode";
import { getLogFormatter } from "../utils/Logger";

import { ExportRecordTable } from "./ExportRecordTable";
import { NetworkNodeTable } from "./NetworkNodeTable";

const logFormatter = getLogFormatter("getCheckInfo");

export const getCheckInfo = async (
  side: Side,
  boardHash: string,
  index: number
) => {
  const where: WhereOptions = { boardHash, side };
  const exportRecord = await ExportRecordTable.findOne({ where });

  if (!exportRecord) {
    throw Error(logFormatter("no export record"));
  }
  const {
    id: recordId,
    maxReachedNodeIndex,
    highestPriorityNodeIndex,
  } = exportRecord;

  const [
    currentNetworkNode,
    levelZeroNode,
    highestPriorityNode,
    maxReachedNode,
  ] = await Promise.all([
    NetworkNodeTable.findOne({ where: { recordId, index } }),
    NetworkNodeTable.findOne({ where: { recordId, index: 0 } }),
    NetworkNodeTable.findOne({
      where: { recordId, index: highestPriorityNodeIndex },
    }),
    NetworkNodeTable.findOne({
      where: { recordId, index: maxReachedNodeIndex },
    }),
  ]);

  if (!currentNetworkNode) {
    throw Error(logFormatter(`no index ${index}`));
  }
  if (!levelZeroNode) {
    throw Error(logFormatter(`no levelZeroNode`));
  }
  if (!highestPriorityNode) {
    throw Error(
      logFormatter(`no highestPriorityNode ${highestPriorityNodeIndex}`)
    );
  }
  if (!maxReachedNode) {
    throw Error(logFormatter(`no maxReachedNode ${maxReachedNodeIndex}`));
  }

  const currentNodeContent = JSON.parse(
    currentNetworkNode.content
  ) as NetworkNode;
  const parentId = currentNodeContent.parent;
  const [parent, ...children] = await Promise.all([
    parentId
      ? NetworkNodeTable.findOne({ where: { recordId, index: parentId } })
      : null,
    ...currentNodeContent.children.map((childId) =>
      NetworkNodeTable.findOne({ where: { recordId, index: childId } })
    ),
  ]);

  const currentNode = {
    ...currentNodeContent,
    parent: parent ? (JSON.parse(parent.content) as NetworkNode) : null,
    children: children
      .map((childNode) =>
        childNode ? (JSON.parse(childNode.content) as NetworkNode) : null
      )
      .filter((item) => !!item),
  };

  return {
    runTimes: exportRecord.runTimes,
    total: exportRecord.total,
    currentNode,
    levelZeroNode: JSON.parse(levelZeroNode.content) as NetworkNode,
    highestPriorityNode: JSON.parse(highestPriorityNode.content) as NetworkNode,
    maxReachedNode: JSON.parse(maxReachedNode.content) as NetworkNode,
  };
};
