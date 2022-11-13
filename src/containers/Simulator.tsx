import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import {
  getBoardWinnerAndScore,
  getHashFromBoard,
  getMovedBoard,
  getAllNextPositions,
} from "../chess";
import { Node } from "../simulator";
import { Board, Side } from "../types";
import ChessBoard from "../components/ChessBoard";

interface IProps {
  board: Board;
  toBeMovedBy: Side;
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

interface State extends Omit<Response, "bestNode"> {
  bestNode?: Node;
  pageNum: number;
  showInitalBoard: boolean;
  times: number;
}

const Container = styled.div`
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  display: grid;
  grid-template-columns: 4fr 1fr;
  flex-wrap: wrap;
  gap: 30px;
`;

const Card = styled.div`
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19);
  list-style: none;
  padding: 0;
  margin: 0;
`;
const Desc = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SecondaryContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  gap: 30px;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-right: auto;
`;

const Title = styled.div`
  font-weight: bold;
`;

const Value = styled.div``;

const TabControl = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-height: 57vh;
  overflow-y: auto;
`;

const TabItem = styled.div`
  width: 250px;
`;

const PAGE_SIZE = 500;

const copyHash = (board: Board) => {
  const text = getHashFromBoard(board);
  navigator.clipboard.writeText(text);
}

const fetchData = async (nodes: Array<Node>, pageNum: number, toBeMovedBy: Side, runTimes = 1) => {
  const response = await fetch("/api/simulate", {
    method: "POST",
    body: JSON.stringify({
      pageNum,
      pageSize: PAGE_SIZE,
      runTimes,
      toBeMovedBy,
      nodes,
    })
  });
  const result = await response.json() as Response;
  return result;
};

const Simulator = ({ board, toBeMovedBy }: IProps) => {
  const initialBoards = useRef(getAllNextPositions(board, toBeMovedBy === Side.Top).map(({ from, to }) => getMovedBoard(board, from, to)));
  const initialNodes = useRef<Array<Node>>([]);

  const [state, setState] = useState<State>({
    pageNum: 1,
    nodeCount: 0,
    showInitalBoard: false,
    nodes: [],
    times: 0,
    timeTaken: 0,
  });


  const handleClick = useCallback(
    async (pageNum: number, times: number) => {
      const response = await fetchData(initialNodes.current, pageNum, toBeMovedBy, times);
      setState(oldState => ({...oldState, ...response, times , pageNum }));
    },
    [toBeMovedBy]
  );

  const isFetched = useRef(false);
  useEffect(() => {
    if(isFetched.current) {
      return;
    }
    isFetched.current = true;

    const nodes = initialBoards.current.map((nextBoard) => {
      const [winner, score] = getBoardWinnerAndScore(nextBoard);
      return {
        board: nextBoard,
        level: 1,
        score,
        levelOneBoard: nextBoard,
        rankingScore: toBeMovedBy === Side.Bottom ? -score : score,
        winner,
      };
    });

    nodes.sort((left, right) => {
      const scoreLeft = left.rankingScore;
      const scoreRight = right.rankingScore;

      if (scoreLeft > scoreRight) return -1;
      else if (scoreLeft === scoreRight) return 0;
      else return 1;
    });
    initialNodes.current = nodes;

    (async() => {
      const TIMES = 100;
      const response = await fetchData(initialNodes.current, 1, toBeMovedBy, TIMES);
      setState(oldState => ({...oldState, ...response, times: oldState.times + TIMES }));
    })()

  }, [board, toBeMovedBy, setState]);

  const isPrevPageAvailable = state.pageNum > 1;
  const isNextPageAvailable = state.pageNum < state.nodeCount / PAGE_SIZE;

  return (
    <Container>
      <LeftColumn>
        <MainContent>
          <div>
            <Card>
              <ChessBoard board={board} />
              <Desc>
                <Title>To be moved by</Title>
                <Value>{toBeMovedBy}</Value>
              </Desc>
            </Card>
            <Desc>
              <Title>Secondary</Title>
              <Value>
                <button onClick={() => setState((old) => ({ ...old, showInitalBoard: !old.showInitalBoard }))}>
                  {state.showInitalBoard ? "initial" : "debug"}
                </button>
              </Value>
            </Desc>
            <Desc>
              <Title>Simulate</Title>
              <Value>
                <button onClick={() => handleClick(1, state.times + 1)}>run</button>
              </Value>
            </Desc>
            <Desc>
              <Title>#</Title>
              <Value>{state.times}</Value>
            </Desc>
            <Desc>
              <Title>Time</Title>
              <Value>{state.timeTaken} ms</Value>
            </Desc>
            <Desc>
              <Title>Count</Title>
              <Value>{state.nodeCount}</Value>
            </Desc>
            <Desc>
              <Title>Page</Title>
              <Value>{state.pageNum}</Value>
            </Desc>
            <Desc>
              <Title><button disabled={!isPrevPageAvailable} onClick={() => isPrevPageAvailable && handleClick(state.pageNum - 1, state.times)}>prev</button></Title>
              <Value><button disabled={!isNextPageAvailable} onClick={() => isNextPageAvailable && handleClick(state.pageNum + 1, state.times)}>next</button></Value>
            </Desc>
          </div>
          <div>
            {state.bestNode &&
            <Card>
              <div onClick={() => state.bestNode && copyHash(state.bestNode.board)}>
                <ChessBoard board={state.bestNode.board} />
              </div>
              <Desc>
                <Title>Score</Title>
                <Value>{state.bestNode.score}</Value>
              </Desc>
              <Desc>
                <Title>Ranking Score</Title>
                <Value>{state.bestNode.rankingScore}</Value>
              </Desc>
              <Desc>
                <Title>From</Title>
                <Value>{initialBoards.current.findIndex((board) => state.bestNode && getHashFromBoard(board) === getHashFromBoard(state.bestNode.levelOneBoard))}</Value>
              </Desc>
            </Card>
            }
          </div>
          <div>
            {state.debug && (
              <Card>
              <div onClick={() => state.debug?.selectedNode && copyHash(state.debug.selectedNode.board)}>
                <ChessBoard board={state.debug.selectedNode.board} />
              </div>
                <Desc>
                  <Title>Score</Title>
                  <Value>{state.debug.selectedNode.score}</Value>
                </Desc>
                <Desc>
                  <Title>Ranking Score</Title>
                  <Value>{state.debug.selectedNode.rankingScore}</Value>
                </Desc>
                <Desc>
                  <Title>Is same</Title>
                  <Value>
                    {state.debug.mostUpsettingNode === state.debug.selectedNode
                      ? "true"
                      : "false"}
                  </Value>
                </Desc>
              </Card>
            )}
          </div>
          <div>
            {state.debug &&
              state.debug.mostUpsettingNode !== state.debug.selectedNode && (
                <Card>
              <div onClick={() => state.debug?.mostUpsettingNode && copyHash(state.debug.mostUpsettingNode.board)}>
                  <ChessBoard board={state.debug.mostUpsettingNode.board} />
              </div>
                  <Desc>
                    <Title>Score</Title>
                    <Value>{state.debug.mostUpsettingNode.score}</Value>
                  </Desc>
                  <Desc>
                    <Title>Ranking Score</Title>
                    <Value>{state.debug.mostUpsettingNode.rankingScore}</Value>
                  </Desc>
                </Card>
            )}
          </div>
        </MainContent>
        <TabControl>
          {state.nodes.map((node, index) => {
            const secondSide =
              toBeMovedBy === Side.Top ? Side.Bottom : Side.Top;
            const selectedSide =
              node.level % 2 === 0 ? toBeMovedBy : secondSide;
            return (
              <TabItem key={index}>
                <Card>
              <div onClick={() => copyHash(node.board)}>
                  <ChessBoard board={node.board} />
              </div>
                  <Desc>
                    <Title>To be moved by</Title>
                    <Value>{selectedSide}</Value>
                  </Desc>
                  <Desc>
                    <Title>Score</Title>
                    <Value>{node.score}</Value>
                  </Desc>
                  <Desc>
                    <Title>Ranking Score</Title>
                    <Value>{node.rankingScore}</Value>
                  </Desc>
                  <Desc>
                    <Title>Winner</Title>
                    <Value>{node.winner}</Value>
                  </Desc>
                  <Desc>
                    <Title>Level</Title>
                    <Value>{node.level}</Value>
                  </Desc>
                  <Desc>
                    <Title>From</Title>
                    <Value>
                      {initialBoards.current.findIndex(
                        (board) => getHashFromBoard(board) === getHashFromBoard(node.levelOneBoard)
                      )}
                    </Value>
                  </Desc>
                </Card>
              </TabItem>
            );
          })}
        </TabControl>
      </LeftColumn>
      <SecondaryContainer>
        {state.showInitalBoard
          ? initialBoards.current.slice(0, 50).map((board, index) => (
            <Card key={`SecondaryBoards-${index}`}>
              <div onClick={() => copyHash(board)}>
                <ChessBoard board={board} />
              </div>
              <Desc>
                <Title>Index</Title>
                <Value>{index}</Value>
              </Desc>
            </Card>
          ))
          : (state.debug?.nextNodes || []).map((node, index) => (
            <Card key={`NextNode-${index}`}>
              <div onClick={() => copyHash(board)}>
                <ChessBoard board={node.board} />
              </div>
              <Desc>
                <Title>Level</Title>
                <Value>{node.level}</Value>
              </Desc>
              <Desc>
                <Title>Score</Title>
                <Value>{node.score}</Value>
              </Desc>
            </Card>
          ))}
      </SecondaryContainer>
    </Container>
  );
};

export default Simulator;
