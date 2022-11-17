import { WhereOptions } from "sequelize";

import { Side } from "../types";
import { NetworkNode } from "../utils/NetworkNode";
import { getLogFormatter } from "../utils/Logger";

import { getSequelize } from "./getSequelize";
import { ExportRecordTable } from "./ExportRecordTable";
import { NetworkNodeTable } from "./NetworkNodeTable";

const logFormatter = getLogFormatter("getOpenSetNetworkNodes");

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
