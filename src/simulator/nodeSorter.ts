import { Node } from "../types";

const nodeSorter = (left: Node, right: Node) => {
  if (left.priority > right.priority) return -1;
  if (left.priority < right.priority) return 1;

  if (left.level > right.level) return -1;
  if (left.level < right.level) return 1;

  return 0;
};

export default nodeSorter;
