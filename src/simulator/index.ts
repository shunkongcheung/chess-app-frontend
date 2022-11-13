import { Board, Side } from "../types";
import {
  getAllNextPositions,
  getBoardWinnerAndScore,
  getMovedBoard,
} from "../chess";

export interface Node {
  board: Board;
  // level 0: start board
  // level 1: all possible options by starter
  // caller shall feed at least from level one
  level: number;
  // node origin board at level one
  levelOneBoard: Board;
  // for Top, higher score is better;
  // for Bottom, lower score is better;
  // rankingScore will normalize it, such that Top and Bottom has positive value when winning
  // On the other hand, a won board will have negative value, as they are not suitable for investment
  rankingScore: number;
  // high score flavor top side, low score flavor bottom side.
  score: number;
  // record exists if any side won
  winner: Side;
}

interface State {
  startSide: Side;
  // should be sorted by rankingScore
  nodes: Array<Node>;
}

interface Ret {
  // should be sorted by rankingScore
  nodes: Array<Node>;
  debug?: {
    selectedNode: Node;
    nextNodes: Array<Node>;
    mostUpsettingNode: Node;
  };
}

const sortNodes = (nodes: Array<Node>) => {
  nodes.sort((left, right) => {
    const scoreLeft = left.rankingScore;
    const scoreRight = right.rankingScore;

    if (scoreLeft > scoreRight) return -1;
    else if (scoreLeft === scoreRight) return 0;
    else return 1;
  });
  return nodes;
};

const simulate = ({ startSide, nodes }: State): Ret => {
  // exception case
  if (!nodes.length) {
    return { nodes: [] };
  }

  // pop winning node
  sortNodes(nodes);
  const selectedNode = nodes[0];

  if(selectedNode.winner !== Side.None) {
    return { nodes };
  }

  const secondSide = startSide === Side.Top ? Side.Bottom : Side.Top;
  const selectedSide = selectedNode.level % 2 === 0 ? startSide : secondSide;

  // generate next moves
  const nextMoves = getAllNextPositions(
    selectedNode.board,
    selectedSide === Side.Top
  );
  const nextBoards = nextMoves.map(({ from, to }) =>
    getMovedBoard(selectedNode.board, from, to)
  );

  const level = selectedNode.level + 1;
  const { levelOneBoard } = selectedNode;

  const nextNodes = nextBoards.map((board) => {
    const [winner, score] = getBoardWinnerAndScore(board);
    const rankingScore = selectedSide === Side.Top ? -score : score;
    return { board, level, levelOneBoard, rankingScore, score, winner };
  });

  // check if score would change after moves
  const mostUpsettingNode = nextNodes.reduce((prevValue, node) => {
    const currDiff = node.score - selectedNode.score;
    const prevDiff = prevValue.score - selectedNode.score;

    const isMoreUpsetting =
      selectedSide === Side.Top ? currDiff > prevDiff : currDiff < prevDiff;
    return isMoreUpsetting ? node : prevValue;
  }, selectedNode);

  const debug = {
    selectedNode,
    nextNodes: nextNodes,
    mostUpsettingNode,
  };

  // if score remain unchange, that means selectedNode is indeed a good move
  // add nextNodes to openset, and remove out selectedNode from openset
  if (mostUpsettingNode === selectedNode) {
    const upsettingNodes = nextNodes.filter(
      (node) => node.score === selectedNode.score
    );
    const newSet = sortNodes(
      upsettingNodes.concat(nodes.filter((item) => item !== selectedNode))
    );
    debug.nextNodes = upsettingNodes;
    return { nodes: newSet, debug };
  }

  // if score changed, that means selected node is not actually a good move
  // discard nextNodes, update score of selectedNode
  const newSet = sortNodes(
    nodes
      .filter((item) => item !== selectedNode)
      .concat([
        {
          ...selectedNode,
          score: mostUpsettingNode.score,
          rankingScore: mostUpsettingNode.rankingScore,
        },
      ])
  );
  return { nodes: newSet, debug };
};

export default simulate;
