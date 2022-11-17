import path from "path";
import getConfig from "next/config";

import { Sequelize } from "sequelize";
import { DB_FILENAME } from "../constants";

import {
  ExportRecordTable,
  initialize as initializeExportRecordTable,
} from "./ExportRecordTable";
import {
  NetworkNodeTable,
  initialize as initializeNetowrkNodeTable,
} from "./NetworkNodeTable";

export const getSequelize = async () => {
  const { PROJECT_ROOT } = getConfig().serverRuntimeConfig;
  const storage = path.join(PROJECT_ROOT, "static", DB_FILENAME);
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

  initializeExportRecordTable(sequelize);
  initializeNetowrkNodeTable(sequelize);

  await sequelize.authenticate();
  await sequelize.sync();

  await Promise.all([NetworkNodeTable.sync(), ExportRecordTable.sync()]);

  return sequelize;
};
