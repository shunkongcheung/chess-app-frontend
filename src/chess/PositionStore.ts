import { Move } from "./types";

export interface PositionListNode<T> {
  node: T
  next?: PositionListNode<T>;
}

type ForEachCallback<T> = (node: T, index: number) => any;

export class PositionStore <T = Move>{
  private _head?: PositionListNode<T>;
  private _end?: PositionListNode<T>;

  public insert (node: T) {
    if(!this._head) {
      this._head = { node };
      this._end = this._head;
    }

    if(!this._end) {
      throw Error();
    }

    this._end.next = { node };
    this._end = this._end.next;
  }

  public join (anotherStore: PositionStore<T>) {
    if(!anotherStore._head) {
      return this;
    }
    else if(!this._head) {
      this._head = anotherStore._head;
      return this;
    }
    else {
      if(!this._end) throw Error();
      this._end.next = anotherStore._head;
      return this;
    }
  }

  public asArray(): Array<T> {
    let head = this._head;
    const openSet: Array<T> = [];
    while (true && head) {
      openSet.push(head.node);
      if (head.next) head = head.next;
      else return openSet;
    }
    return openSet;
  }

  public forEach(callback: ForEachCallback<T>) {
    let head = this._head;
    let index  = 0;
    while(head) {
      callback(head.node, index++);
      head = head.next;
    }
  }

  get end() {
    return this._end?.node;
  }
}


