import { Node } from "../types";

export interface NetworkNode extends Omit<Node, "parent" | "children"> {
  parent?: number;
  children: Array<number>;
}

export const getNetworkNodeFromDataNode = (node: Node): NetworkNode => ({
  ...node,
  parent: node.parent ? node.parent.index : undefined,
  children: node.children.map((item) => item.index),
});

export const getOpenSetFromNetworkOpenSet = (
  networkOpenSet: Array<NetworkNode>
): Array<Node> => {
  const openSet: Array<Node> = networkOpenSet.map((node) => ({
    ...node,
    parent: undefined,
    children: [],
  }));

  openSet.map((node, index) => {
    const networkNode = networkOpenSet[index];
    node.parent = openSet.find((item) => item.index === networkNode.parent);
    node.children = openSet.filter((node) =>
      networkNode.children.includes(node.index)
    );
  });

  return openSet;
};