interface SortNode {
  level: number;
  priority: number;
}

const nodeSorter = (left: SortNode, right: SortNode) => {
  if (left.priority > right.priority) return -1;
  if (left.priority < right.priority) return 1;

  if (left.level > right.level) return -1;
  if (left.level < right.level) return 1;

  return 0;
};

export default nodeSorter;
