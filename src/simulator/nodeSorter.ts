interface SortNode {
  level: number;
  priority: number;
  score: number;
}

const nodeSorter = (left: SortNode, right: SortNode) => {
  if (left.priority > right.priority) return -1;
  if (left.priority < right.priority) return 1;

  if (left.level < right.level) return -1;
  if (left.level > right.level) return 1;

  // this code seems to have done nothing
  // const leftAbsScore = Math.abs(left.score);
  // const rightAbsScore = Math.abs(right.score);
  // if (leftAbsScore > rightAbsScore) return -1;
  // if (leftAbsScore < rightAbsScore) return 1;

  return 0;
};

export default nodeSorter;
