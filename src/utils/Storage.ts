import { DataTypes, Sequelize, Model } from "sequelize";
import path from "path";
import getConfig from "next/config";

import { Node, Side } from "../types";
import { NetworkNode, getNetworkNodeFromDataNode } from "./NetworkNode";

class NetworkNodeTable extends Model {
  declare traceId: string;
  declare content: string;
}

const getTraceId = (levelZeroSide: Side, boardHash: string, index: number) => {
  return `${levelZeroSide}-${boardHash}-${index}`;
};

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
      traceId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { sequelize }
  );
  await NetworkNodeTable.sync();

  return { sequelize };
};

export const storeOpenSet = async (
  levelZeroSide: Side,
  boardHash: string,
  nodes: Array<Node>
) => {
  await getSequelize();
  const networkNodes = nodes.map((node) => getNetworkNodeFromDataNode(node));

  const tableEntries = networkNodes.map((networkNode) => ({
    traceId: getTraceId(levelZeroSide, boardHash, networkNode.index),
    content: JSON.stringify(networkNode),
  }));

  await NetworkNodeTable.bulkCreate(tableEntries, { ignoreDuplicates: true });
};

export const getFileOpenSet = async (
  levelZeroSide: Side,
  boardHash: string,
  index: number
) => {
  await getSequelize();
  const traceId = getTraceId(levelZeroSide, boardHash, index);

  const primaryNetworkNode = await NetworkNodeTable.findByPk(traceId);
  if (!primaryNetworkNode) throw Error();

  const target = JSON.parse(primaryNetworkNode.content) as NetworkNode;

  if (target.parent) {
    const parentTraceId = getTraceId(levelZeroSide, boardHash, target.parent);
    const parentNetworkNode = await NetworkNodeTable.findByPk(parentTraceId);
    if (parentNetworkNode)
      target.parent = JSON.parse(parentNetworkNode.content);
  }

  target.children = await Promise.all(
    target.children.map(async (childIndex) => {
      const childTraceId = getTraceId(levelZeroSide, boardHash, childIndex);
      const childNetworkNode = await NetworkNodeTable.findByPk(childTraceId);
      return childNetworkNode
        ? JSON.parse(childNetworkNode.content)
        : childIndex;
    })
  );

  return target;
};
