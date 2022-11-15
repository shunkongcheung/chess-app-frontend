import { Node } from "../types";
import { getHashFromBoard } from "../chess";

export interface NetworkNode extends Omit<Node, "parent" | "children"> {
  parent: string;
  children: Array<string>;
}

export const getNetworkNodeFromDataNode = (node: Node): NetworkNode => ({
  ...node,
  parent: node.parent ? getHashFromBoard(node.parent.board) : "",
  children: node.children.map((item) => getHashFromBoard(item.board)),
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
    node.parent = openSet.find(
      (item) => getHashFromBoard(item.board) === networkNode.parent
    );
    node.children = openSet.filter((node) =>
      networkNode.children.includes(getHashFromBoard(node.board))
    );
  });

  return openSet;
};
