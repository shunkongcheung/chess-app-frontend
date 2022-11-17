import { DataTypes, Sequelize, Model, WhereOptions, Op } from "sequelize";
import path from "path";
import getConfig from "next/config";

import { Node, Side } from "../types";
import { NetworkNode, getNetworkNodeFromDataNode } from "./NetworkNode";

class ExportRecordTable extends Model {
  declare id: number;
  declare side: string;
  declare boardHash: string;
  declare runTimes: number;
}

class NetworkNodeTable extends Model {
  declare recordId: string;
  declare index: number;
  declare content: string;
}

const getSequelize = async () => {
  const { PROJECT_ROOT } = getConfig().serverRuntimeConfig;
  const storage = path.join(PROJECT_ROOT, "static", "database.sqlite");
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

  await sequelize.authenticate();
  await sequelize.sync();

  NetworkNodeTable.init(
    {
      recordId: {
        type: DataTypes.INTEGER,
      },
      index: {
        type: DataTypes.INTEGER,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { sequelize }
  );

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
  let existingCount = 0;
  const existingExportRecord = await ExportRecordTable.findOne({
    where: { boardHash, runTimes, side },
  });

  if (existingExportRecord) {
    recordId = existingExportRecord.id;
    existingCount = await NetworkNodeTable.count({ where: { recordId } });
  } else {
    const newExportRecord = await ExportRecordTable.create({
      boardHash,
      runTimes,
      side,
    });
    recordId = newExportRecord.id;
  }

  const tableEntries = networkNodes
    .filter((networkNodes) => networkNodes.index >= existingCount)
    .map((networkNode) => ({
      recordId,
      index: networkNode.index,
      content: JSON.stringify(networkNode),
    }));

  await NetworkNodeTable.bulkCreate(tableEntries);
  await sequelize.close();
};

export const getOpenSetNetworkNodes = async (
  side: Side,
  boardHash: string,
  runTimes?: number
): Promise<{
  networkNodes: Array<NetworkNode>;
  runTimes: number;
}> => {
  const sequelize = await getSequelize();

  const where: WhereOptions = { boardHash, side };
  if (runTimes) where.runTimes = { [Op.lte]: runTimes };
  const exportRecords = await ExportRecordTable.findAll({
    where,
    order: [["runTimes", "desc"]],
  });

  if (!exportRecords.length) {
    await sequelize.close();
    throw Error("getFileOpenSet: no such record");
  }

  const bestExportRecord = exportRecords[0];
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
