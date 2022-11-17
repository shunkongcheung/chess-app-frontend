import { BoardNode, Side } from "../types";

const getIsNodeTerminated = (node: BoardNode): boolean => {
  // termination condition: already marked as terminated
  if (node.isTerminated) return true;

  // termination condition: has a winner
  if (node.winner !== Side.None) return true;

  return false;
};

export default getIsNodeTerminated;
