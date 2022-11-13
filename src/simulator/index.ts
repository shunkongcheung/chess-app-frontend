import { Board, Side } from "../types";
import { getAllNextPositions, getBoardWinnerAndScore, getMovedBoard } from "../chess";

export interface Node {
  board: Board;
  // level 0: start board
  // level 1: all possible options by starter
  // caller shall feed at least from level one
  level: number; 
  // high score flavor top side, low score flavor bottom side.
  score: number; 
  // node origin board at level one
  levelOneBoard: Board;
  // record exists if any side won
  winner?: Side; 
}

interface State {
  startSide: Side;
  nodes: Array<Node>;
  side: Side;
}

interface Ret {
  nodes: Array<Node>;
  debug?: {
    selectedNode: Node;
    nextNodes: Array<Node>;
  }
}

const sortNodes = (nodes: Array<Node>, side: Side) => {
  nodes.sort((left, right) => {
    const scoreLeft = left.score;
    const scoreRight = right.score;

    // put alredy won chess board to the back, they are not calculated
    if(!left.winner && right.winner) {
      return -1;
    }
    if(left.winner && !right.winner) {
      return 1;
    }

    if(scoreLeft > scoreRight) return side === Side.Top ? -1 : 1;
    else if(scoreLeft === scoreRight) return 0;
    else return side === Side.Top ? 1 : -1;
  });
  return nodes;
}


const simulate = ({ startSide, nodes, side }: State): Ret => {
  // exception case
  if(!nodes.length) return { nodes: [] };

  // pop extreme node from 
  const selectedNode: Node = nodes[0];
  const secondSide = startSide === Side.Top ? Side.Bottom : Side.Top;
  const selectedSide = selectedNode.level % 2 === 0 ? startSide : secondSide;

  const nextMoves = getAllNextPositions(selectedNode.board, selectedSide === Side.Top);
  const nextBoards = nextMoves.map(({ from, to }) => getMovedBoard(selectedNode.board, from, to));
  const level = selectedNode.level + 1;
  const { levelOneBoard } = selectedNode;

  const nextNodes = nextBoards.map(board => {
    const [potentialWinner, score] = getBoardWinnerAndScore(board);
    const winner = potentialWinner !== Side.None ? potentialWinner : undefined;
    return { board, level, score, levelOneBoard, winner };
  });

  const debug = { selectedNode, nextNodes };
  return { 
    nodes : sortNodes(nodes.filter(item => item !== selectedNode).concat(nextNodes), side),
    debug
  };
}

export { sortNodes, simulate };
