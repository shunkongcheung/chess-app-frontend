import { Sequelize, WhereOptions } from "sequelize";

import { BoardNode, Side } from "../types";
import { getLogFormatter } from "../utils/Logger";

import { ExportRecordTable } from "./ExportRecordTable";
import { getBoardNodeFromNetworkNode, NetworkNodeTable } from "./NetworkNodeTable";

const logFormatter = getLogFormatter("getCheckInfo");

interface FriendlyNode extends Omit<BoardNode, "children" | "parent"> {
  parent: BoardNode | null;
  children: Array<BoardNode>
}

export const getCheckInfo = async (
  sequelize: Sequelize,
  side: Side,
  boardHash: string,
  index: number
) => {

  const where: WhereOptions = { boardHash, side };
  const exportRecord = await ExportRecordTable.findOne({ where });

  if (!exportRecord) {
    await sequelize.close();
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

  const currBoardNode = getBoardNodeFromNetworkNode(currentNetworkNode);
  const parentId = currBoardNode.parent;
  const [parent, ...children] = await Promise.all([
    parentId
      ? NetworkNodeTable.findOne({ where: { recordId, index: parentId } })
      : null,
    ...currBoardNode.children.map((childId) =>
      NetworkNodeTable.findOne({ where: { recordId, index: childId } })
    ),
  ]);

  const currentNode: FriendlyNode = {
    ...currBoardNode,
    parent: parent ? getBoardNodeFromNetworkNode(parent) : null,
    children: children
      .filter(item => item !== null)
      .map((childNode) =>getBoardNodeFromNetworkNode(childNode!))
        
      
  };

  return {
    recordId,
    runTimes: exportRecord.runTimes,
    total: exportRecord.total,
    currentNode,
    levelZeroNode: getBoardNodeFromNetworkNode(levelZeroNode),
    highestPriorityNode: getBoardNodeFromNetworkNode(highestPriorityNode),
    maxReachedNode: getBoardNodeFromNetworkNode(maxReachedNode),
  };
};