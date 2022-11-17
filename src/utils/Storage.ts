import { DataTypes, Sequelize, Model, WhereOptions } from "sequelize";
import path from "path";
import getConfig from "next/config";

import { Node, Side } from "../types";
import { NetworkNode, getNetworkNodeFromDataNode } from "./NetworkNode";
import { getHashFromBoard } from "../chess";
import { getLogFormatter } from "./Logger";
import { PSEUDO_HIGH_PRIORITY } from "../constants";

class ExportRecordTable extends Model {
  declare id: number;
  declare side: string;
  declare boardHash: string;
  declare runTimes: number;
  declare total: number;
  declare highestPriorityNodeIndex: number;
  declare maxReachedNodeIndex: number;
}

class NetworkNodeTable extends Model {
  declare recordId: string;
  declare index: number;
  declare level: number;
  declare shortHash: string;
  declare content: string;
}

const logFormatter = getLogFormatter("Storage");

const DB_FILENAME = "database.sqlite";

const getSequelize = async () => {
  const { PROJECT_ROOT } = getConfig().serverRuntimeConfig;
  const storage = path.join(PROJECT_ROOT, "static", DB_FILENAME);
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

  await sequelize.authenticate();
  await sequelize.sync();

  ExportRecordTable.init(
    {
      side: {
        type: DataTypes.STRING,
      },
      boardHash: {
        type: DataTypes.STRING,
      },
      runTimes: {
        type: DataTypes.INTEGER,
      },
      total: {
        type: DataTypes.INTEGER,
      },
      highestPriorityNodeIndex: {
        type: DataTypes.INTEGER,
      },
      maxReachedNodeIndex: {
        type: DataTypes.INTEGER,
      },
    },
    { sequelize }
  );

  NetworkNodeTable.init(
    {
      recordId: {
        type: DataTypes.INTEGER,
      },
      index: {
        type: DataTypes.INTEGER,
      },
      shortHash: {
        type: DataTypes.STRING,
      },
      level: {
        type: DataTypes.INTEGER,
      },
      content: {
        type: DataTypes.TEXT,
      },
    },
    { sequelize }
  );

  await Promise.all([NetworkNodeTable.sync(), ExportRecordTable.sync()]);

  return sequelize;
};

export const storeOpenSet = async (
  side: Side,
  boardHash: string,
  nodes: Array<Node>,
  runTimes: number
) => {
  const sequelize = await getSequelize();
  const networkNodes = nodes.map((node) => getNetworkNodeFromDataNode(node));
  let recordId = -1;

  const maxReachedNode = networkNodes.reduce(
    (prev, curr) => (prev.level > curr.level ? prev : curr),
    networkNodes[0]
  );

  const highestPriorityNode = networkNodes.reduce((prev, curr) => {
    if (curr.priority === PSEUDO_HIGH_PRIORITY) return prev;
    if (curr.priority > prev.priority) {
      return curr;
    }
    return prev;
  }, networkNodes[networkNodes.length - 1]);

  const exportInfo = {
    boardHash,
    side,
    runTimes,
    total: nodes.length,
    maxReachedNodeIndex: maxReachedNode.index,
    highestPriorityNodeIndex: highestPriorityNode.index,
  };

  const existingExportRecord = await ExportRecordTable.findOne({
    where: { boardHash, side },
  });
  if (existingExportRecord) {
    recordId = existingExportRecord.id;
    await existingExportRecord.update(exportInfo);
  } else {
    const newExportRecord = await ExportRecordTable.create(exportInfo);
    recordId = newExportRecord.id;
  }

  await NetworkNodeTable.destroy({ where: { recordId } });

  const tableEntries = networkNodes.map((networkNode) => ({
    recordId,
    index: networkNode.index,
    level: networkNode.level,
    shortHash: getHashFromBoard(networkNode.board),
    content: JSON.stringify(networkNode),
  }));

  await NetworkNodeTable.bulkCreate(tableEntries);
  await sequelize.close();
};

export const getOpenSetNetworkNodes = async (
  side: Side,
  boardHash: string,
  maxRunTimes?: number
): Promise<{
  networkNodes: Array<NetworkNode>;
  runTimes: number;
}> => {
  const sequelize = await getSequelize();

  const where: WhereOptions = { boardHash, side };
  const exportRecord = await ExportRecordTable.findOne({ where });

  if (!exportRecord) {
    await sequelize.close();
    throw Error(logFormatter("no such record"));
  }

  if (!!maxRunTimes && exportRecord.runTimes >= maxRunTimes) {
    await sequelize.close();
    const msg = `existing runTimes ${exportRecord.runTimes} >= ${maxRunTimes}`;
    const formatted = logFormatter(msg);
    throw Error(formatted);
  }

  const bestExportRecord = exportRecord;
  const recordId = bestExportRecord.id;

  const queryResult = await NetworkNodeTable.findAll({ where: { recordId } });
  const networkNodes: Array<NetworkNode> = queryResult.map(({ content }) =>
    JSON.parse(content)
  );

  await sequelize.close();
  return {
    networkNodes,
    runTimes: bestExportRecord.runTimes,
  };
};

export const getCheckInfo = async (
  side: Side,
  boardHash: string,
  index: number
) => {
  const sequelize = await getSequelize();

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
    await sequelize.close();
    throw Error(logFormatter(`no index ${index}`));
  }
  if (!levelZeroNode) {
    await sequelize.close();
    throw Error(logFormatter(`no levelZeroNode`));
  }
  if (!highestPriorityNode) {
    await sequelize.close();
    throw Error(
      logFormatter(`no highestPriorityNode ${highestPriorityNodeIndex}`)
    );
  }
  if (!maxReachedNode) {
    await sequelize.close();
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
