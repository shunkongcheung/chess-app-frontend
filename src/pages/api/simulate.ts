import type { NextApiRequest, NextApiResponse } from "next";
import { getHashFromBoard } from "../../chess";
import { run } from "../../simulator";
import { Side, Node } from "../../types";

interface NetworkNode extends Omit<Node, "parent" | "children"> {
  parent: string;
  children: Array<string>;
}

export interface Payload {
  runTimes?: number; // default 1
  levelZeroSide: Side;
  openSet: Array<NetworkNode>;
  maximumLevel?: number; // default 5
}

export interface Result {
  timeTaken: number;
  pointer: string;
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
    runTimes = 1,
    levelZeroSide,
    openSet: networkOpenSet,
    maximumLevel = 5,
  } = payload;

  if (runTimes < 1) {
    const response: Result = {
      timeTaken: 0,
      pointer: "",
      openSet: networkOpenSet,
      nextNodes: [],
      maximumLevel,
    };
    return res.status(200).json(response);
  }

  const startTime = performance.now();
  const openSet = getOpenSetFromNetworkOpenSet(networkOpenSet);
  const levelZeroNode = openSet.find((item) => item.level === 0)!;

  let result = run({
    levelZeroScore: levelZeroNode.score,
    levelZeroSide,
    openSet,
    maximumLevel,
  });
  for (let index = 1; index < runTimes; index++) {
    result = run({
      ...result,
      levelZeroScore: levelZeroNode.score,
      levelZeroSide,
      maximumLevel,
    });
    if (index % 100 === 0)
      console.log(
        `${index}: ${performance.now() - startTime}ms - ${
          result.openSet.length
        }`
      );
  }
  const endTime = performance.now();

  const response: Result = {
    pointer: result.pointer ? getHashFromBoard(result.pointer.board) : "",
    openSet: result.openSet.map(getNetworkNodeFromDataNode),
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
