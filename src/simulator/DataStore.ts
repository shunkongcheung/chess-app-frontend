import { getHashFromBoard } from "../chess";

export interface LinkedListNode<T> {
  node: T;
  prev?: LinkedListNode<T>;
  next?: LinkedListNode<T>;
}

type Sorter<T> = (left: T, right: T) => number;

type GetKeyFromNode<T> = (node: T) => string;

interface HashMap<T> {
  [x: string]: LinkedListNode<T>;
}

class DataStore<T> {
  private _count: number;
  private _getKeyFromNode: GetKeyFromNode<T>;
  private _hashMap: HashMap<T>;
  private _head: LinkedListNode<T>;
  private _sorter: Sorter<T>;

  public constructor(
    getKeyFromNode: GetKeyFromNode<T>,
    sorter: Sorter<T>,
    nodes: Array<T>
  ) {
    this._count = nodes.length;
    this._getKeyFromNode = getKeyFromNode;
    this._sorter = sorter;
    this._hashMap = {};
    const openSet = [...nodes].sort(sorter);
    this._head = { node: openSet[0] };

    let prev = this._head;
    this._hashMap[getKeyFromNode(openSet[0])] = this._head;

    for (let idx = 1; idx < openSet.length; idx++) {
      const listNode = { node: openSet[idx], prev };
      prev.next = listNode;
      this._hashMap[getKeyFromNode(openSet[idx])] = listNode;
      prev = listNode;
    }
  }

  get length() {
    return this._count;
  }

  get head() {
    return this._head;
  }

  public asArray(): Array<T> {
    let head = this._head;
    const openSet: Array<T> = [];
    while (true) {
      openSet.push(head.node);
      if (head.next) head = head.next;
      else return openSet;
    }
  }

  public getIsNodeExists(node: T): boolean {
    const key = this._getKeyFromNode(node);
    return key in this._hashMap;
  }

  public insert(node: T): T {
    if (this.getIsNodeExists(node)) {
      throw Error("insert: node already exists");
    }

    const linkedListNode: LinkedListNode<T> = { node };
    const key = this._getKeyFromNode(node);
    this._hashMap[key] = linkedListNode;
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

      if (!pointer.prev) throw Error("insert: prev is undefined");
      pointer.prev.next = linkedListNode;
      pointer.prev = linkedListNode;
    }

    return linkedListNode.node;
  }

  public update(node: T): T {
    const key = this._getKeyFromNode(node);
    const linkedListNode = this._hashMap[key];
    if (!linkedListNode) throw Error("update: linked list node not exist");

    // let compare = this._sorter(node, linkedListNode.node);
    // if (compare === 0) {
    //   return linkedListNode.node;
    // }

    if (linkedListNode.prev) linkedListNode.prev.next = linkedListNode.next;
    else if (linkedListNode.next) {
      this._head = linkedListNode.next;
    } else {
      // this is the only node in the list
      return linkedListNode.node;
    }

    if (linkedListNode.next) linkedListNode.next.prev = linkedListNode.prev;

    this._count -= 1;
    delete this._hashMap[key];
    return this.insert(node);
  }
}

export default DataStore;
