import {Sequelizer, Op} from "sequelize";
import {getBoardFromHash, getBoardWinnerAndScore} from "../chess";
import {PSEUDO_HIGH_PRIORITY} from "../constants";
import { BoardNode, Side } from "../types";

import { ExportRecordTable } from "./ExportRecordTable";
import {getSequelize} from "./getSequelize";
import { getBoardNodeFromNetworkNode, NetworkNodeTable } from "./NetworkNodeTable";

class DataStore {
  private _recordId: number = -1;
  private _sequelizer: Sequelizer

  private _getNetworkNodeFromBoardNode (boardNode: Partial<BoardNode>) {
    const ret: { [x:string]: any } = { 
      ...boardNode ,
      recordId: this._recordId,
    }
    if(!Number.isNaN(ret.level)) ret.isEvenLevel = ret.level % 2 === 0;
    if(boardNode.relatives) ret.relatives = JSON.stringify(ret.relatives);
    if(boardNode.children) ret.children = JSON.stringify(ret.children);
    return ret;
  }

  public async initalize(boardHash: string, side: Side, sequelizer: Sequelizer) {
    this._sequelizer = sequelizer;
    const [exportRecordTeble, isCreated] = await ExportRecordTable.findOrCreate({
      where: { boardHash, side },
      defaults: { boardHash, side, runTimes: 0, total: 0, highestPriorityNodeIndex: 0, maxReachedNodeIndex: 0 }
    });
    this._recordId = exportRecordTeble.id;

    console.log("hello created", isCreated);
    if(isCreated) {
      const [winner, score] = getBoardWinnerAndScore(getBoardFromHash(boardHash));
      const createInfo = {
        boardHash,
        index: 0,
        level: 0,
        score,
        winner,
        priority: 0,
        isOpenForCalculation: true,
        isTerminated: false,
        relatives: [],
        children: []
      }
      await this.insert(createInfo);
    }

    return exportRecordTeble.runTimes;
  }

  public async record(runTimes: number) {
    const [maxReachedNode, highestPriorityNode , total] = await Promise.all([
      NetworkNodeTable.findAll({
        where: { recordId: this._recordId },
        order: [["level", "desc"]],
        limit: 1
      }),
      NetworkNodeTable.findAll({
        where: { 
          recordId: this._recordId, 
          priority : { [Op.ne]:PSEUDO_HIGH_PRIORITY }
        },
        order: [["priority", "desc"]],
        limit: 1
      }),
      this.count()
    ]);

    await ExportRecordTable.update(
      {
        maxReachedNodeIndex: maxReachedNode[0]?.index || 0,
        highestPriorityNode: highestPriorityNode[0]?.index || 0,
        runTimes,
        total,
      },
      { where: { id: this._recordId } } ,
    );
  }

  public async count(): Promise<number> {
    return NetworkNodeTable.count({ 
      where: { recordId: this._recordId }
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
      limit: 1
    });

    if(!query.length) return undefined;
    return getBoardNodeFromNetworkNode(query[0]);
  }

  public async getNode(boardNode: BoardNode): Promise<BoardNode | undefined> {
    const networkNode = await NetworkNodeTable.findOne({
      where: { 
        recordId: this._recordId, 
        boardHash: boardNode.boardHash,
        isEvenLevel: boardNode.level % 2 === 0,
      }
    });
    return networkNode ? getBoardNodeFromNetworkNode(networkNode) : undefined;
  }

  public async getNodeById(index: number): Promise<BoardNode> {
    const networkNode = await NetworkNodeTable.findOne({
      where: {  recordId: this._recordId,  index }
    });
    if(!networkNode) throw Error(`Id ${index} not found`);
    return getBoardNodeFromNetworkNode(networkNode);
  }

  public async getNodes(indexes: Array<number>): Promise<Array<BoardNode>> {
    const networkNode = await NetworkNodeTable.findAll({
      where: { 
        recordId: this._recordId, 
        index: { [Op.in]: indexes }
      }
    });
    return networkNode.map(getBoardNodeFromNetworkNode);
  }

  public async insert(boardNode: BoardNode): Promise<void> {
    await NetworkNodeTable.create(this._getNetworkNodeFromBoardNode(boardNode))
  }

  public async update(index: number, boardNode: Partial<BoardNode>): Promise<void> {
    const updatedInfo = this._getNetworkNodeFromBoardNode(boardNode);
    await NetworkNodeTable.update(updatedInfo, { where: { recordId: this._recordId, index }});
  }
}

export default DataStore;

