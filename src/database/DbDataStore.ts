import { Op } from "sequelize";
import { BoardNode, Side } from "../types";

import {
  getBoardNodeFromNetworkNode,
  NetworkNodeTable,
} from "./NetworkNodeTable";

import {
  DataStore,
  initialize,
  getNetworkNodeFromBoardNode,
  record,
} from "./BaseDataStore";

class DbDataStore implements DataStore {
  private _recordId: number = -1;

  public async initialize(boardHash: string, side: Side) {
    const { recordId, runTimes } = await initialize(boardHash, side);
    this._recordId = recordId;
    return runTimes;
  }

  public async record(runTimes: number) {
    record(this._recordId, runTimes);
  }

  public async count(): Promise<number> {
    return NetworkNodeTable.count({
      where: { recordId: this._recordId },
    });
  }

  public async head(): Promise<BoardNode | undefined> {
    const query = await NetworkNodeTable.findAll({
      where: {
        recordId: this._recordId,
        isTerminated: false,
        isOpenForCalculation: true,
      },
      order: [
        ["priority", "desc"],
        ["level", "asc"],
      ],
      limit: 1,
    });

    if (!query.length) return undefined;
    return getBoardNodeFromNetworkNode(query[0]);
  }

  public async getNode(boardNode: BoardNode): Promise<BoardNode | undefined> {
    const networkNode = await NetworkNodeTable.findOne({
      where: {
        recordId: this._recordId,
        boardHash: boardNode.boardHash,
        isEvenLevel: boardNode.level % 2 === 0,
      },
    });
    return networkNode ? getBoardNodeFromNetworkNode(networkNode) : undefined;
  }

  public async getNodeById(index: number): Promise<BoardNode> {
    const networkNode = await NetworkNodeTable.findOne({
      where: { recordId: this._recordId, index },
    });
    if (!networkNode) throw Error(`Id ${index} not found`);
    return getBoardNodeFromNetworkNode(networkNode);
  }

  public async getNodes(indexes: Array<number>): Promise<Array<BoardNode>> {
    const networkNode = await NetworkNodeTable.findAll({
      where: {
        recordId: this._recordId,
        index: { [Op.in]: indexes },
      },
    });
    return networkNode.map(getBoardNodeFromNetworkNode);
  }

  public async insert(boardNode: BoardNode): Promise<void> {
    await NetworkNodeTable.create(
      getNetworkNodeFromBoardNode(this._recordId, boardNode)
    );
  }

  public async update(
    index: number,
    boardNode: Partial<BoardNode>
  ): Promise<void> {
    const updatedInfo = getNetworkNodeFromBoardNode(this._recordId, boardNode);
    await NetworkNodeTable.update(updatedInfo, {
      where: { recordId: this._recordId, index },
    });
  }
}

export default DbDataStore;
