import { Side } from "../types";

interface SortNode {
  level: number;
  priority: number;
  score: number;
}

const choiceSorter = (side: Side) => (left: SortNode, right: SortNode) => {
  if (Math.round(left.priority) > Math.round(right.priority)) return -1;
  if (Math.round(left.priority) < Math.round(right.priority)) return 1;

  if (side === Side.Top) {
    if (Math.round(left.score) > Math.round(right.score)) return -1;
    if (Math.round(left.score) < Math.round(right.score)) return 1;
  }
  if (side === Side.Bottom) {
    if (Math.round(left.score) < Math.round(right.score)) return -1;
    if (Math.round(left.score) > Math.round(right.score)) return 1;
  }

  return 0;
};

export default choiceSorter;
