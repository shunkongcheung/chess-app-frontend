
import type { NextApiRequest, NextApiResponse } from "next";
import simulate, { Node } from "../../simulator";
import { Side } from "../../types";

interface Payload {
  pageNum?: number; // default 1
  pageSize?: number; // default 50
  runTimes?: number; // default 1
  toBeMovedBy: Side;
  nodes: Array<Node>;
}

interface Response {
  nodeCount: number;
  bestNode: Node;
  nodes: Array<Node>;
  debug?: {
    selectedNode: Node;
    nextNodes: Array<Node>;
    mostUpsettingNode: Node;
  };
  timeTaken: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = JSON.parse(req.body) as Payload;
  const {pageNum = 1, pageSize = 1, runTimes = 1, toBeMovedBy, nodes  } = payload;

  const startTime = performance.now();
  let result = simulate({ startSide: toBeMovedBy, nodes });
  for (let index = 1; index < runTimes; index++) {
    result = simulate({ startSide: toBeMovedBy, nodes: result.nodes });
    if(index % 100 === 0) console.log(`${index}: ${performance.now() - startTime}ms`);
  }
  const endTime = performance.now();

  const bestNode = result.nodes.reduce((prev, curr) => {
    const isBetter = toBeMovedBy === Side.Top ?
      curr.score > prev.score
    : curr.score < prev.score;

    return isBetter ? curr : prev;
  }, result.nodes[0]);

  const response: Response = {
    nodeCount: result.nodes.length,
    bestNode,
    nodes: result.nodes.slice(pageSize * (pageNum - 1), pageSize * pageNum),
    debug: result.debug,
    timeTaken: Math.round(endTime - startTime),
  };

  console.log(`${performance.now() - startTime}ms`);
  res.status(200).json(response)
}
