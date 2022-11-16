import { DataTypes, Sequelize, Model, WhereOptions, Op } from "sequelize";
import path from "path";
import getConfig from "next/config";

import { Node, Side } from "../types";
import { NetworkNode, getNetworkNodeFromDataNode } from "./NetworkNode";

class ExportRecordTable extends Model {
  declare id: number;
  declare side: string;
  declare boardHash: string;
  declare maximumLevel: number;
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
      maximumLevel: {
        type: DataTypes.INTEGER,
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
  maximumLevel: number,
  runTimes: number
) => {
  const sequelize = await getSequelize();
  const networkNodes = nodes.map((node) => getNetworkNodeFromDataNode(node));

  let recordId = -1;
  const existingExportRecord = await ExportRecordTable.findOne({
    where: { boardHash, maximumLevel, runTimes, side },
  });

  if (existingExportRecord) {
    recordId = existingExportRecord.id;
    await NetworkNodeTable.destroy({ where: { recordId } });
  } else {
    const newExportRecord = await ExportRecordTable.create({
      boardHash,
      maximumLevel,
      runTimes,
      side,
    });
    recordId = newExportRecord.id;
  }

  const tableEntries = networkNodes.map((networkNode) => ({
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
  maximumLevel?: number,
  runTimes?: number
): Promise<{
  networkNodes: Array<NetworkNode>;
  maximumLevel: number;
  runTimes: number;
}> => {
  const sequelize = await getSequelize();

  const where: WhereOptions = { boardHash, side };
  if (maximumLevel) where.maximumLevel = maximumLevel;
  if (runTimes) where.runTimes = { [Op.lte]: runTimes };
  const exportRecords = await ExportRecordTable.findAll({
    where,
    order: [
      ["runTimes", "desc"],
      ["maximumLevel", "desc"],
    ],
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
    maximumLevel: bestExportRecord.maximumLevel,
    runTimes: bestExportRecord.runTimes,
  };
};
