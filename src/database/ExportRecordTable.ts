import { DataTypes, Model, Sequelize } from "sequelize";

export class ExportRecordTable extends Model {
  declare id: number;
  declare side: string;
  declare boardHash: string;
  declare runTimes: number;
  declare total: number;
  declare highestPriorityNodeIndex: number;
  declare maxReachedNodeIndex: number;
}

export const initialize = (sequelize: Sequelize) => {
  ExportRecordTable.init(
    {
      side: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      boardHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      runTimes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      highestPriorityNodeIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maxReachedNodeIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { sequelize }
  );
};
