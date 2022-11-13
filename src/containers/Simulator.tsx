import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";

import { getBoardWinnerAndScore, getMovedBoard, getAllNextPositions } from "../chess";
import  { simulate, sortNodes, Node } from "../simulator";
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
  }
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

const Card = styled.div `
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19);
  list-style: none;
  padding: 0;
  margin: 0;
`
const Desc = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 5px;
  border-bottom: 1px solid #eee;
`;

const LeftColumn = styled.div `
display: flex;
flex-direction: column;
gap: 30px;
`

const SecondaryContainer = styled.div `
  height: 100%;
  overflow-y: auto;
  gap: 30px;
  display: flex;
  flex-direction: column;
`

const MainContent = styled.div `
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 30px;
margin-right: auto;
`

const Title = styled.div`
  font-weight: bold;
`;

const Value = styled.div``;

const TabControl = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
  const initialBoards = useRef(getAllNextPositions(board, toBeMovedBy === Side.Top).map(({ from, to }) => getMovedBoard(board, from, to)));

  const handleClick = () => {
    setState(({ nodes, times }) => {
      const runTimes = 1000;
      const startTime = performance.now();

      for (let index = 0; index < runTimes; index ++) {
        const ret = simulate({ startSide: toBeMovedBy, nodes, side: index % 2 ? Side.Top : Side.Bottom })
        nodes = ret.nodes;
        console.log(`${index}: ${performance.now() - startTime}ms`);
      }
      const endTime = performance.now();
      return { nodes, times: times + runTimes, timeTaken: endTime - startTime, };
    });
  }

  useEffect(() => {
    const initialNodes = initialBoards.current.map(nextBoard => {
      const [winner, score] = getBoardWinnerAndScore(nextBoard);
      return {
        board: nextBoard,
        level: 1,
        score,
        levelOneBoard: nextBoard,
        winner
      }
    });
    setState({
      nodes: sortNodes(initialNodes, Side.Bottom),
      times: 0,
      timeTaken: 0,
    });
  }, [board, toBeMovedBy, setState]);

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
                <button onClick={() => setShowInitialBoard(old => !old)}>
                  {showInitalBoard ? "initial" : "debug"}
                </button>
              </Value>
            </Desc>
            <Desc>
              <Title>Simulate</Title>
              <Value><button onClick={handleClick}>run</button></Value>
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
            {state.debug?.selectedNode && <ChessBoard board={state.debug?.selectedNode.board} />}
          </div>
        </MainContent>
        <TabControl>
          {state.nodes.slice(0, 50).map((node, index) => {
            const secondSide = toBeMovedBy === Side.Top ? Side.Bottom : Side.Top;
            const selectedSide = node.level % 2 === 0 ? toBeMovedBy : secondSide;
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
                    <Title>Winner</Title>
                    <Value>{node.winner}</Value>
                  </Desc>
                  <Desc>
                    <Title>Level</Title>
                    <Value>{node.level}</Value>
                  </Desc>
                  <Desc>
                    <Title>From</Title>
                    <Value>{initialBoards.current.findIndex(board => board === node.levelOneBoard)}</Value>
                  </Desc>
                </Card>
              </TabItem>
            )
          })}
        </TabControl>
      </LeftColumn>
      <SecondaryContainer>
        {
          showInitalBoard ?
            initialBoards.current.map((board, index) => (
              <Card key={`SecondaryBoards-${index}`}>
                <ChessBoard board={board} />
                <Desc>
                  <Title>Index</Title>
                  <Value>{index}</Value>
                </Desc>
              </Card>))
              :
                (state.debug?.nextNodes || []).map((node, index) => (
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
}

export default Simulator;
