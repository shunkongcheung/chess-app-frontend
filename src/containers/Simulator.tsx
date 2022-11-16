import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { Board, Side, Node } from "../types";
import ChessBoard from "../components/ChessBoard";
import { Payload, Result } from "../pages/api/simulate";
import {
  getNetworkNodeFromDataNode,
  getOpenSetFromNetworkOpenSet,
} from "../utils/NetworkNode";

interface IProps {
  board: Board;
  exportTimes: number;
  increment: number;
  toBeMovedBy: Side;
}

interface State extends Omit<Result, "pointer" | "openSet" | "nextNodes"> {
  pointer?: Node;
  openSet: Array<Node>;
  nextNodes: Array<Node>; // debug only
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

const PAGE_SIZE = 50;

const copyHash = (board: Board) => {
  const text = getHashFromBoard(board);
  navigator.clipboard.writeText(text);
};

const fetchData = async (payload: Payload) => {
  const response = await fetch("/api/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as Result;
  return result;
};

const Simulator = ({
  board,
  increment,
  exportTimes,
  toBeMovedBy: levelZeroSide,
}: IProps) => {
  const initialSet = useRef<Array<Node>>([
    {
      index: 0,
      board,
      level: 0,
      score: getBoardWinnerAndScore(board)[1],
      winner: Side.None,
      isTerminated: false,
      priority: 0,
      relatives: [],
      children: [],
      isOpenForCalculation: true,
    },
  ]);

  const [state, setState] = useState<State>({
    openSet: initialSet.current,
    nextNodes: [],
    runTimes: 0,
    total: 1,
    timeTaken: 0,
    maximumLevel: 0,
    pageNum: 1,
    pageSize: 1,
    isOpenOnly: false,
    isSorted: false,
  });


  const handleClick = useCallback(
    async (
      pageNum: number,
      isOpenOnly: boolean,
      isSorted: boolean,
      runTimes: number,
      isExport = false
    ) => {
      const networkOpenSet = initialSet.current.map(getNetworkNodeFromDataNode);
      const response = await fetchData({
        pageNum,
        isOpenOnly,
        isSorted,
        openSet: networkOpenSet,
        levelZeroSide,
        runTimes,
        isExport,
      });
      const newOpenSet = getOpenSetFromNetworkOpenSet(response.openSet);
      setState((oldState) => ({
        ...oldState,
        ...response,
        pointer: response.pointer
          ? (response.pointer as unknown as Node)
          : undefined,
        openSet: newOpenSet,
        nextNodes: getOpenSetFromNetworkOpenSet(response.nextNodes),
      }));
    },
    [levelZeroSide]
  );

  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const isPrevPageAvailable = state.pageNum > 1;
  const totalPage = Math.ceil(state.total / PAGE_SIZE);
  const isNextPageAvailable = state.pageNum < totalPage;

  return (
    <Container>
      <LeftColumn>
        <MainContent>
          <div>
            <Card>
              <ChessBoard board={board} />
              <Desc>
                <Title>Level Side</Title>
                <Value>{levelZeroSide}</Value>
              </Desc>
              <Desc>
                <Title>Score</Title>
                <Value>{getBoardWinnerAndScore(board)[1]}</Value>
              </Desc>
              <Desc>
                <Title>#</Title>
                <Value>{state.runTimes}</Value>
              </Desc>
              <Desc>
                <Title>Time</Title>
                <Value>{state.timeTaken} ms</Value>
              </Desc>
              <Desc>
                <Title>Count</Title>
                <Value>{state.total}</Value>
              </Desc>
              <Desc>
                <Title>Maximum level</Title>
                <Value>{state.maximumLevel}</Value>
              </Desc>
              <Desc>
                <Title>Page</Title>
                <Value>
                  {state.pageNum}/{totalPage}
                </Value>
              </Desc>
              <Desc>
                <Title>
                  <button
                    onClick={() =>
                      setState((old) => {
                        handleClick(
                          old.pageNum,
                          !old.isOpenOnly,
                          old.isSorted,
                          old.runTimes
                        );
                        return old;
                      })
                    }
                  >
                    Open: {`${state.isOpenOnly}`}
                  </button>
                </Title>
                <Value>
                  <button
                    onClick={() =>
                      setState((old) => {
                        handleClick(
                          old.pageNum,
                          old.isOpenOnly,
                          !old.isSorted,
                          old.runTimes
                        );
                        return old;
                      })
                    }
                  >
                    Sorted: {`${state.isSorted}`}
                  </button>
                </Value>
              </Desc>
              <Desc>
                <Title>
                  <button
                    disabled={!isPrevPageAvailable}
                    onClick={() =>
                      isPrevPageAvailable &&
                      setState((old) => {
                        handleClick(
                          old.pageNum - 1,
                          old.isOpenOnly,
                          old.isSorted,
                          old.runTimes
                        );
                        return old;
                      })
                    }
                  >
                    prev
                  </button>
                </Title>
                <Value>
                  <button
                    disabled={!isNextPageAvailable}
                    onClick={() =>
                      isNextPageAvailable &&
                      setState((old) => {
                        handleClick(
                          old.pageNum + 1,
                          old.isOpenOnly,
                          old.isSorted,
                          old.runTimes
                        );
                        return old;
                      })
                    }
                  >
                    next
                  </button>
                </Value>
              </Desc>
              <Desc>
                <Title>
                  <button
                    onClick={async () => await handleClick(1, false, false, exportTimes, true)}
                  >
                    export
                  </button>
                </Title>
                <Value>
                  <button
                    onClick={() =>
                      setState((old) => {
                        handleClick(
                          old.pageNum,
                          old.isOpenOnly,
                          old.isSorted,
                          old.runTimes + increment
                        );
                        return old;
                      })
                    }
                  >
                    run
                  </button>
                </Value>
              </Desc>
            </Card>
          </div>
          <div>
            {state.pointer && (
              <Card>
                <div
                  onClick={() => state.pointer && copyHash(state.pointer.board)}
                >
                  <ChessBoard board={state.pointer.board} />
                </div>
                <Desc>
                  <Title>Level Side</Title>
                  <Value>
                    {state.pointer.level % 2 === 0
                      ? levelZeroSide
                      : levelOneSide}
                  </Value>
                </Desc>
                <Desc>
                  <Title>Score</Title>
                  <Value>{state.pointer.score}</Value>
                </Desc>
                <Desc>
                  <Title>Winner</Title>
                  <Value>{state.pointer.winner}</Value>
                </Desc>
                <Desc>
                  <Title>Level</Title>
                  <Value>{state.pointer.level}</Value>
                </Desc>
                <Desc>
                  <Title>Priority</Title>
                  <Value>{state.pointer.priority}</Value>
                </Desc>
                <Desc>
                  <Title>Is Open</Title>
                  <Value>{`${state.pointer.isOpenForCalculation}`}</Value>
                </Desc>
                <Desc>
                  <Title>Is Terminated</Title>
                  <Value>{`${state.pointer.isTerminated}`}</Value>
                </Desc>
              </Card>
            )}
          </div>
        </MainContent>
        <TabControl>
          {state.openSet.map((node, index) => {
            const selectedSide =
              node.level % 2 === 0 ? levelZeroSide : levelOneSide;

            return (
              <TabItem key={index}>
                <Card>
                  <div onClick={() => copyHash(node.board)}>
                    <ChessBoard board={node.board} />
                  </div>
                  <Desc>
                    <Title>Index</Title>
                    <Value>{node.index}</Value>
                  </Desc>
                  <Desc>
                    <Title>Level Side</Title>
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
                    <Title>Priority</Title>
                    <Value>{node.priority}</Value>
                  </Desc>
                  <Desc>
                    <Title>Is Open</Title>
                    <Value>{`${node.isOpenForCalculation}`}</Value>
                  </Desc>
                  <Desc>
                    <Title>Is Terminated</Title>
                    <Value>{`${node.isTerminated}`}</Value>
                  </Desc>
                </Card>
              </TabItem>
            );
          })}
        </TabControl>
      </LeftColumn>
      <SecondaryContainer>
        {(state.nextNodes || []).map((node, index) => (
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
            <Desc>
              <Title>Priority</Title>
              <Value>{node.priority}</Value>
            </Desc>
          </Card>
        ))}
      </SecondaryContainer>
    </Container>
  );
};

export default Simulator;
