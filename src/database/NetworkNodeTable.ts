import { DataTypes, Sequelize, Model } from "sequelize";
import { BoardNode, Side } from "../types";

export class NetworkNodeTable extends Model {
  // to connect to ExportReportTable
  declare recordId: number;
  // board's hash
  declare boardHash: string;
  // order that the node is inserted
  declare index: number;
  // level 0: start board
  // level 1: all possible options by starter
  // caller shall feed at least from level one
  declare level: number;
  declare isEvenLevel: boolean;
  // high score flavor top side, low score flavor bottom side.
  declare score: number;
  // used for sorting which item to node to choose as next pointer
  declare priority: number;
  // record exists if any side won
  declare winner: string; // Side
  // whether node should be considered when chosing next pointer
  declare isOpenForCalculation: boolean;
  // whether termination condition is reached
  declare isTerminated: boolean;
  // connection nodes: the one that generate current node
  declare parent: number;
  // connection nodes: not the one generate current node, but can also generate current node
  declare relatives: string;
  // connection nodes
  declare children: string;
}

export const initialize = (sequelize: Sequelize) => {
  NetworkNodeTable.init(
    {
      recordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      boardHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isEvenLevel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      winner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isOpenForCalculation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      isTerminated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      parent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      relatives: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      children: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { sequelize }
  );
};

export const getBoardNodeFromNetworkNode = (
  networkNode: NetworkNodeTable
): BoardNode => {
  return {
    boardHash: networkNode.boardHash,
    index: networkNode.index,
    level: networkNode.level,
    score: networkNode.score,
    parent: networkNode.parent,
    priority: networkNode.priority,
    winner: networkNode.winner as Side,
    isOpenForCalculation: networkNode.isOpenForCalculation,
    isTerminated: networkNode.isTerminated,
    relatives: JSON.parse(networkNode.relatives) as Array<number>,
    children: JSON.parse(networkNode.children) as Array<number>,
  };
};
