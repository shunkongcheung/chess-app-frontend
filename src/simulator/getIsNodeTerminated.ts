import { Node, Side } from "../types";

const getIsNodeTerminated = (node: Node, maximumLevel: number): boolean => {
  // termination condition: already marked as terminated
  if (node.isTerminated) return true;

  // termination condition: has a winner
  if (node.winner !== Side.None) return true;

  // termination condition: maximum level reached
  if (node.level >= maximumLevel) return true;

  // TODO: is this valid? should be?
  // termination condition: all children are terminated
  if (node.children.length) {
    const isAllChildrenTerminated = node.children.every(
      (node) => node.isTerminated
    );
    if (isAllChildrenTerminated) return true;
  }
  return false;
};

export default getIsNodeTerminated;
