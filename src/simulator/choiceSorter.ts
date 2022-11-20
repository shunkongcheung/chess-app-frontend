import { Side } from "../types";

interface SortNode {
  level: number;
  priority: number;
  score: number;
}

const choiceSorter = (side: Side) => (left: SortNode, right: SortNode) => {
  const PRIORITY_MIN_DIFF = 0.5;
  if (left.priority > right.priority + PRIORITY_MIN_DIFF) return -1;
  if (left.priority + PRIORITY_MIN_DIFF < right.priority) return 1;

  if (side === Side.Top) {
    if (left.score > right.score + PRIORITY_MIN_DIFF) return -1;
    if (left.score + PRIORITY_MIN_DIFF < right.score) return 1;
  }
  if (side === Side.Bottom) {
    if (left.score < right.score + PRIORITY_MIN_DIFF) return -1;
    if (left.score + PRIORITY_MIN_DIFF > right.score) return 1;
  }
  return 0;
};

export default choiceSorter;
