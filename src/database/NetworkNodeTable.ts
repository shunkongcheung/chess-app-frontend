import { DataTypes, Sequelize, Model } from "sequelize";

export class NetworkNodeTable extends Model {
  declare recordId: string;
  declare index: number;
  declare level: number;
  declare shortHash: string;
  declare isOpenForCalculation: boolean;
  declare isTerminated: boolean;
  declare priority: number;
  declare content: string;
}

export const initialize = (sequelize: Sequelize) => {
  NetworkNodeTable.init(
    {
      recordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shortHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    { sequelize }
  );
};
