// import { getHashFromBoard } from "../chess";
import { getLogFormatter } from "../utils/Logger";

export interface StoreNode<T> {
  node: T;
  prev?: StoreNode<T>;
  next?: StoreNode<T>;
}

type Sorter<T> = (left: T, right: T) => number;
type Filter<T> = (node: T) => boolean;

type GetKeyFromNode<T> = (node: T) => string;

const logFormatter = getLogFormatter("DataStore");

class DataStore<T> {
  private _count: number;
  private _getKeyFromNode: GetKeyFromNode<T>;
  private _hashMap: Map<string, StoreNode<T>>;
  private _head: StoreNode<T>;
  private _sorter: Sorter<T>;
  private _filter: Filter<T>;

  public constructor(
    getKeyFromNode: GetKeyFromNode<T>,
    sorter: Sorter<T>,
    filter: Filter<T>,
    nodes: Array<T>
  ) {
    this._count = nodes.length;
    this._getKeyFromNode = getKeyFromNode;
    this._sorter = sorter;
    this._filter = filter;

    this._hashMap = new Map();
    const openSet = [...nodes].sort(sorter);
    this._head = { node: openSet[0] };

    let prev = this._head;
    this._hashMap.set(getKeyFromNode(openSet[0]), this._head);

    for (let idx = 1; idx < openSet.length; idx++) {
      const listNode = { node: openSet[idx], prev };
      prev.next = listNode;
      this._hashMap.set(getKeyFromNode(openSet[idx]), listNode);
      prev = listNode;
    }
  }

  get length() {
    return this._count;
  }

  get head (): T | undefined {
    let head = this._head;
    while (true) {
      if (this._filter(head.node))
        return head.node;
      if (head.next) head = head.next;
      else return undefined;
    }
  };

  public asArray(): Array<T> {
    let head = this._head;
    const openSet: Array<T> = [];
    while (true) {
      openSet.push(head.node);
      if (head.next) head = head.next;
      else return openSet;
    }
  }

  public getNode(node: T): T | undefined {
    const key = this._getKeyFromNode(node);
    return this._hashMap.get(key)?.node;
  }

  public insert(node: T): T {
    if (!!this.getNode(node)) {
      throw Error(logFormatter("node already exists"));
    }

    const linkedListNode: StoreNode<T> = { node };
    const key = this._getKeyFromNode(node);
    this._hashMap.set(key, linkedListNode);
    // this._hashMap[key] = linkedListNode;
    this._count += 1;

    if (this._sorter(node, this._head.node) <= 0) {
      linkedListNode.next = this._head;
      this._head.prev = linkedListNode;
      this._head = linkedListNode;
      return linkedListNode.node;
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

    return linkedListNode.node;
  }

  public update(node: T): T {
    const key = this._getKeyFromNode(node);
    const linkedListNode = this._hashMap.get(key);
    // const linkedListNode = this._hashMap[key];
    if (!linkedListNode)
      throw Error(logFormatter("linked list node not exist"));

    if (linkedListNode.prev) linkedListNode.prev.next = linkedListNode.next;
    else if (linkedListNode.next) {
      this._head = linkedListNode.next;
    } else {
      // this is the only node in the list
      return linkedListNode.node;
    }

    if (linkedListNode.next) linkedListNode.next.prev = linkedListNode.prev;

    this._count -= 1;
    this._hashMap.delete(key);
    // delete this._hashMap[key];
    return this.insert(node);
  }
}

export default DataStore;
