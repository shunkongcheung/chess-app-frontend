import { BoardNode, Side } from "../types";
import { getLogFormatter } from "../utils/Logger";
import {
  DataStore,
  initialize,
  getNetworkNodeFromBoardNode,
  record,
} from "./BaseDataStore";
import {
  getBoardNodeFromNetworkNode,
  NetworkNodeTable,
} from "./NetworkNodeTable";

export interface LinkedListNode {
  node: BoardNode;
  prev?: LinkedListNode;
  next?: LinkedListNode;
}

interface BoardHashMap {
  [x: string]: LinkedListNode;
}

interface IndexMap {
  [x: number]: LinkedListNode;
}

const logFormatter = getLogFormatter("InMemoryDataStore");

class InMemoryDataStore implements DataStore {
  private _recordId: number;
  private _count: number;
  private _boardHashMap: BoardHashMap;
  private _indexMap: IndexMap;
  private _head: LinkedListNode;

  public constructor() {
    this._recordId = -1;
    this._count = -1;
    this._boardHashMap = {};
    this._indexMap = {};
    this._head = undefined as unknown as LinkedListNode;
  }

  private _getKeyFromNode(boardNode: BoardNode) {
    return `${boardNode.boardHash}-${boardNode.index}`;
  }

  private _sorter(left: BoardNode, right: BoardNode) {
    if (left.priority > right.priority) return -1;
    if (left.priority < right.priority) return 1;

    if (left.level < right.level) return -1;
    if (left.level > right.level) return 1;

    return 0;
  }

  public async initialize(boardHash: string, side: Side) {
    const { recordId, runTimes } = await initialize(boardHash, side);
    const networkNodes = await NetworkNodeTable.findAll({
      where: { recordId },
      order: [
        ["priority", "desc"],
        ["level", "asc"],
      ],
    });
    const boardNodes = networkNodes.map(getBoardNodeFromNetworkNode);

    this._count = boardNodes.length;
    this._recordId = recordId;
    this._head = { node: boardNodes[0] };

    let prev = this._head;
    this._boardHashMap[this._getKeyFromNode(this._head.node)] = this._head;
    this._indexMap[this._head.node.index] = this._head;

    for (let idx = 1; idx < boardNodes.length; idx++) {
      const listNode = { node: boardNodes[idx], prev };
      prev.next = listNode;
      this._boardHashMap[this._getKeyFromNode(listNode.node)] = listNode;
      this._indexMap[listNode.node.index] = listNode;
      prev = listNode;
    }

    return runTimes;
  }

  public async record(runTimes: number) {
    const boardNodeArr = Array(this._count);
    let pointer: LinkedListNode | undefined = this._head;

    for (
      let idx = 0;
      idx < this._count && !!pointer;
      idx++, pointer = pointer.next
    ) {
      boardNodeArr[idx] = getNetworkNodeFromBoardNode(
        this._recordId,
        pointer.node
      );
    }

    await NetworkNodeTable.destroy({ where: { recordId: this._recordId } });
    await NetworkNodeTable.bulkCreate(boardNodeArr);
    await record(this._recordId, runTimes);
  }

  count() {
    return this._count;
  }

  head() {
    let pointer = this._head;
    while (true) {
      if (!pointer.node.isTerminated && pointer.node.isOpenForCalculation)
        return pointer.node;
      if (pointer.next) pointer = pointer.next;
      else return undefined;
    }
  }

  public getNode(node: BoardNode): BoardNode | undefined {
    // note: cant use index here!
    const key = this._getKeyFromNode(node);
    return this._boardHashMap[key]?.node;
  }

  public getNodeById(index: number): BoardNode {
    if (index === 0) {
    }
    const node = this._indexMap[index]?.node;
    if (!node) {
      throw logFormatter(`${index} not found`);
    }
    return node;
  }

  public getNodes(indexes: Array<number>): Array<BoardNode> {
    return indexes
      .map((index) => this._indexMap[index]?.node)
      .filter((item) => !!item);
  }

  public insert(node: BoardNode): void {
    if (!!this.getNode(node)) {
      throw Error(logFormatter("node already exists"));
    }

    const linkedListNode: LinkedListNode = { node };
    const key = this._getKeyFromNode(node);
    this._boardHashMap[key] = linkedListNode;
    this._indexMap[node.index] = linkedListNode;
    this._count += 1;

    if (this._sorter(node, this._head.node) <= 0) {
      linkedListNode.next = this._head;
      this._head.prev = linkedListNode;
      this._head = linkedListNode;
      return;
    }

    let pointer = this._head;
    while (pointer.next && this._sorter(node, pointer.node) > 0) {
      pointer = pointer.next;
    }

    if (this._sorter(node, pointer.node) > 0) {
      pointer.next = linkedListNode;
      linkedListNode.prev = pointer;
    } else {
      linkedListNode.prev = pointer.prev;
      linkedListNode.next = pointer;

      if (!pointer.prev) throw Error(logFormatter("prev is undefined"));
      pointer.prev.next = linkedListNode;
      pointer.prev = linkedListNode;
    }
  }

  public update(index: number, node: Partial<BoardNode>) {
    const linkedListNode = this._indexMap[index];
    if (!linkedListNode)
      throw Error(logFormatter("linked list node not exist"));

    if (linkedListNode.prev) linkedListNode.prev.next = linkedListNode.next;
    else if (linkedListNode.next) this._head = linkedListNode.next;
    else {
      // this is the only node in the list
      return;
    }

    if (linkedListNode.next) linkedListNode.next.prev = linkedListNode.prev;

    this._count -= 1;
    delete this._boardHashMap[this._getKeyFromNode(linkedListNode.node)];
    delete this._indexMap[index];
    const newNode = { ...linkedListNode.node, ...node };
    this.insert(newNode);
  }
}

export default InMemoryDataStore;
