import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import {
  getBoardWinnerAndScore,
  getMovedBoard,
  getAllNextPositions,
} from "../chess";
import simulate, { getBestNodeForStarterBoard, Node } from "../simulator";
import { Board, Side } from "../types";
import ChessBoard from "../components/ChessBoard";

interface IProps {
  board: Board;
  toBeMovedBy: Side;
}

interface State {
  nodes: Array<Node>;
  debug?: {
    selectedNode: Node;
    nextNodes: Array<Node>;
    mostUpsettingNode: Node;
  };
  timeTaken: number;
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
  max-height: 65vh;
  overflow-y: auto;
`;

const TabItem = styled.div`
  width: 250px;
`;

const Simulator = ({ board, toBeMovedBy }: IProps) => {
  const [state, setState] = useState<State>({
    nodes: [],
    times: 0,
    timeTaken: 0,
  });
  const [showInitalBoard, setShowInitialBoard] = useState(false);
  const initialBoards = useRef(
    getAllNextPositions(board, toBeMovedBy === Side.Top).map(({ from, to }) =>
      getMovedBoard(board, from, to)
    )
  );

  const handleClick = useCallback(
    (runTimes = 1) => {
      setState(({ nodes, times }) => {
        const startTime = performance.now();

        let ret = simulate({ startSide: toBeMovedBy, nodes });
        for (let index = 1; index < runTimes; index++) {
          ret = simulate({ startSide: toBeMovedBy, nodes: ret.nodes });
          console.log(`${index}: ${performance.now() - startTime}ms`);
        }
        const endTime = performance.now();
        const finalRet = {
          ...ret,
          times: times + runTimes,
          timeTaken: endTime - startTime,
        };
        return finalRet;
      });
    },
    [toBeMovedBy]
  );

  useEffect(() => {
    const initialNodes = initialBoards.current.map((nextBoard) => {
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

    initialNodes.sort((left, right) => {
      const scoreLeft = left.rankingScore;
      const scoreRight = right.rankingScore;

      if (scoreLeft > scoreRight) return -1;
      else if (scoreLeft === scoreRight) return 0;
      else return 1;
    });

    setState({ nodes: initialNodes, times: 0, timeTaken: 0 });

    handleClick(1000);
  }, [board, toBeMovedBy, setState, handleClick]);

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
                <button onClick={() => setShowInitialBoard((old) => !old)}>
                  {showInitalBoard ? "initial" : "debug"}
                </button>
              </Value>
            </Desc>
            <Desc>
              <Title>Simulate</Title>
              <Value>
                <button onClick={() => handleClick()}>run</button>
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
              <Value>{state.nodes.length}</Value>
            </Desc>
          </div>
          <div>
            {state.debug && (
              <Card>
                <ChessBoard board={state.debug.selectedNode.board} />
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
                  <ChessBoard board={state.debug.mostUpsettingNode.board} />
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
                  <ChessBoard board={node.board} />
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
                        (board) => board === node.levelOneBoard
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
        {showInitalBoard
          ? initialBoards.current.slice(0, 50).map((board, index) => (
              <Card key={`SecondaryBoards-${index}`}>
                <ChessBoard board={board} />
                <Desc>
                  <Title>Index</Title>
                  <Value>{index}</Value>
                </Desc>
              </Card>
            ))
          : (state.debug?.nextNodes || []).map((node, index) => (
              <Card key={`NextNode-${index}`}>
                <ChessBoard board={node.board} />
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
