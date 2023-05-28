// import { getHashFromBoard } from "../chess";
import { getLogFormatter } from "../utils/Logger";

export interface LinkedListNode<T> {
  node: T;
  prev?: LinkedListNode<T>;
  next?: LinkedListNode<T>;
}

type Sorter<T> = (left: T, right: T) => number;

type GetKeyFromNode<T> = (node: T) => string;

// interface HashMap<T> {
//   [x: string]: LinkedListNode<T>;
// }

const logFormatter = getLogFormatter("DataStore");

class DataStore<T> {
  private _count: number;
  private _getKeyFromNode: GetKeyFromNode<T>;
  // private _hashMap: HashMap<T>;
  private _hashMap: Map<string, LinkedListNode<T>>;
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
    // this._hashMap = {};
    this._hashMap = new Map();
    const openSet = [...nodes].sort(sorter);
    this._head = { node: openSet[0] };

    let prev = this._head;
    this._hashMap.set(getKeyFromNode(openSet[0]), this._head);
    // this._hashMap[getKeyFromNode(openSet[0])] = this._head;

    for (let idx = 1; idx < openSet.length; idx++) {
      const listNode = { node: openSet[idx], prev };
      prev.next = listNode;
      this._hashMap.set(getKeyFromNode(openSet[idx]), listNode);
      // this._hashMap[getKeyFromNode(openSet[idx])] = listNode;
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

  public getNode(node: T): T | undefined {
    const key = this._getKeyFromNode(node);
    return this._hashMap.get(key)?.node;
    // return this._hashMap[key]?.node;
  }

  public insert(node: T): T {
    if (!!this.getNode(node)) {
      throw Error(logFormatter("node already exists"));
    }

    const linkedListNode: LinkedListNode<T> = { node };
    const key = this._getKeyFromNode(node);
    this._hashMap.set(key, linkedListNode);

    if (this._sorter(node, this._head.node) <= 0) {
      this._count += 1;
      linkedListNode.next = this._head;
      this._head.prev = linkedListNode;
      this._head = linkedListNode;
      return linkedListNode.node;
    }

    let [left, right] = [0, this._count];
    let mid = Math.ceil((left + right) / 2);

    let pointer = this._head;
    for(let idx = 0; idx < mid; idx ++) {
      if(!pointer.next) throw Error(logFormatter(`next is undefined ${idx}, ${mid}, ${this._count}`));
      pointer = pointer.next;
    }

    while (true) {
      const prevMid = mid;
      const compare = this._sorter(node, pointer.node);
      if(compare > 0) {
        left = mid;
        if(left === (right - 1)) {
          // larger than the largest node in list
          pointer.next = linkedListNode;
          linkedListNode.prev = pointer;
          break;
        }
      } else {
        // check if previous is smaller
        if(!pointer.prev) throw Error(logFormatter("prev is undefined"));

        if(this._sorter(node, pointer.prev.node) > 0) {
          linkedListNode.prev = pointer.prev;
          linkedListNode.next = pointer;

          pointer.prev.next = linkedListNode;
          pointer.prev = linkedListNode;
          break;
        } else {
          right = mid;
        }
      }

      mid = Math.ceil((left + right) / 2);

      const diff = Math.abs(prevMid - mid);
      for(let idx = 0; idx < diff; idx ++){
        if(prevMid > mid) pointer = pointer.prev!;
        else pointer = pointer.next!;
      }
    }

    this._count += 1;

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
