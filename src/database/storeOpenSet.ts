// import { NetworkNode, Side } from "../types";
// import { getHashFromBoard } from "../chess";
// import { PSEUDO_HIGH_PRIORITY } from "../constants";

// import { getNetworkNodeFromDataNode } from "../utils/NetworkNode";

// import { ExportRecordTable } from "./ExportRecordTable";
// import { NetworkNodeTable } from "./NetworkNodeTable";
// import { getSequelize } from "./getSequelize";

// export const storeOpenSet = async (
//   side: Side,
//   boardHash: string,
//   nodes: Array<Node>,
//   runTimes: number
// ) => {
//   const sequelize = await getSequelize();
//   const networkNodes = nodes.map((node) => getNetworkNodeFromDataNode(node));
//   let recordId = -1;

//   const maxReachedNode = networkNodes.reduce(
//     (prev, curr) => (prev.level > curr.level ? prev : curr),
//     networkNodes[0]
//   );

//   const highestPriorityNode = networkNodes.reduce((prev, curr) => {
//     if (curr.priority === PSEUDO_HIGH_PRIORITY) return prev;
//     if (curr.priority > prev.priority) {
//       return curr;
//     }
//     return prev;
//   }, networkNodes[networkNodes.length - 1]);

//   const exportInfo = {
//     boardHash,
//     side,
//     runTimes,
//     total: nodes.length,
//     maxReachedNodeIndex: maxReachedNode.index,
//     highestPriorityNodeIndex: highestPriorityNode.index,
//   };

//   const existingExportRecord = await ExportRecordTable.findOne({
//     where: { boardHash, side },
//   });
//   if (existingExportRecord) {
//     recordId = existingExportRecord.id;
//     await existingExportRecord.update(exportInfo);
//   } else {
//     const newExportRecord = await ExportRecordTable.create(exportInfo);
//     recordId = newExportRecord.id;
//   }

//   await NetworkNodeTable.destroy({ where: { recordId } });

//   const tableEntries = networkNodes.map((networkNode) => ({
//     recordId,
//     index: networkNode.index,
//     level: networkNode.level,
//     shortHash: getHashFromBoard(networkNode.board),
//     content: JSON.stringify(networkNode),
//   }));

//   await NetworkNodeTable.bulkCreate(tableEntries);
//   await sequelize.close();
// };
