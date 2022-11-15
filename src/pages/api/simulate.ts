import type { NextApiRequest, NextApiResponse } from "next";
import { getHashFromBoard } from "../../chess";
import { run } from "../../simulator";
import { Side, Node } from "../../types";

interface NetworkNode extends Omit<Node, "parent" | "children"> {
  parent: string;
  children: Array<string>;
}

export interface Payload {
  pageNum?: number; // default 1
  pageSize?: number; // default 50
  isSorted?: boolean; // default false
  isOpenOnly?: boolean; // default false
  runTimes?: number; // default 1
  levelZeroSide: Side;
  openSet: Array<NetworkNode>;
  maximumLevel?: number; // default 5
}

export interface Result {
  pageNum: number;
  pageSize: number;
  isSorted: boolean;
  isOpenOnly: boolean;
  runTimes: number;
  total: number;
  timeTaken: number;
  pointer?: NetworkNode;
  openSet: Array<NetworkNode>;
  nextNodes: Array<NetworkNode>;
  maximumLevel: number;
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = JSON.parse(req.body) as Payload;
  const {
    pageNum = 1,
    pageSize = 50,
    isSorted = false,
    isOpenOnly = false,
    runTimes = 1,
    levelZeroSide,
    openSet: networkOpenSet,
    maximumLevel = 5,
  } = payload;

  const startTime = performance.now();
  const openSet = getOpenSetFromNetworkOpenSet(networkOpenSet);
  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  const onHundredCallback = (idx: number, length: number) => {
    console.log(`${idx}: ${performance.now() - startTime}ms - ${length}`);
  };
  let result = run({
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    maximumLevel,
    runTimes,
    onHundredCallback,
  });
  const endTime = performance.now();

  let resultSet = result.openSet.map(getNetworkNodeFromDataNode);
  if (!isSorted) {
    resultSet.sort((a, b) => {
      if (a.index < b.index) return -1;
      if (a.index > b.index) return 1;
      return 0;
    });
  }

  if (isOpenOnly) {
    resultSet = resultSet.filter(
      (item) => item.isOpenForCalculation && !item.isTerminated
    );
  }

  const response: Result = {
    pageNum,
    pageSize,
    isOpenOnly,
    isSorted,
    runTimes,
    total: result.openSet.length,
    pointer: result.pointer ? getNetworkNodeFromDataNode(result.pointer) : undefined,
    openSet: resultSet.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    nextNodes: result.nextNodes.map(getNetworkNodeFromDataNode),
    timeTaken: Math.round(endTime - startTime),
    maximumLevel,
  };

  console.log(
    `finished (${runTimes}}: ${performance.now() - startTime}ms - ${
      result.openSet.length
    }`
  );
  res.status(200).json(response);
}
