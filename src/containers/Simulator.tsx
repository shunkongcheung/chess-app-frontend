import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { Board, Side, Node } from "../types";
import ChessBoard from "../components/ChessBoard";
import {
  getNetworkNodeFromDataNode,
  getOpenSetFromNetworkOpenSet,
  Payload,
  Result,
} from "../pages/api/simulate";
import { nodeSorter } from "../simulator";

interface IProps {
  board: Board;
  toBeMovedBy: Side;
}

interface State extends Omit<Result, "openSet" | "nextNodes"> {
  openSet: Array<Node>;
  nextNodes: Array<Node>; // debug only
  times: number;
  controls: {
    pageNum: number;
    isSorted: boolean;
    isOpenOnly: boolean;
  };
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

const Simulator = ({ board, toBeMovedBy: levelZeroSide }: IProps) => {
  const [state, setState] = useState<State>((): State => {
    const openSet = [
      {
        index: 0,
        board,
        level: 0,
        score: getBoardWinnerAndScore(board)[1],
        winner: Side.None,
        isTerminated: false,
        priority: 0,
        children: [],
        isOpenForCalculation: true,
      },
    ];
    return {
      openSet,
      pointer: "",
      nextNodes: [],
      times: 0,
      timeTaken: 0,
      maximumLevel: 0,
      controls: {
        pageNum: 1,
        isSorted: false,
        isOpenOnly: false,
      },
    };
  });

  const handleClick = useCallback(
    async (runTimes: number) => {
      const { openSet } = state;
      const networkOpenSet = openSet.map(getNetworkNodeFromDataNode);

      const response = await fetchData({
        openSet: networkOpenSet,
        levelZeroSide,
        runTimes,
      });

      const newOpenSet = getOpenSetFromNetworkOpenSet(response.openSet);
      setState((oldState) => ({
        ...oldState,
        maximumLevel: response.maximumLevel,
        pointer: response.pointer,
        openSet: newOpenSet,
        nextNodes: getOpenSetFromNetworkOpenSet(response.nextNodes),
        timeTaken: response.timeTaken,
        times: oldState.times + runTimes,
      }));
    },
    [state, levelZeroSide]
  );

  // const isInitialized = useRef(false);
  // useEffect(() => {
  //   if (isInitialized.current) return;
  //   isInitialized.current = true;
  const TIMES = 5000;
  //   handleClick(TIMES);
  // }, [handleClick]);

  const prevPointer = state.openSet.find(
    (item) => getHashFromBoard(item.board) === state.pointer
  );
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const renderOpenSet = useMemo<Array<Node>>(() => {
    let newSet = [...state.openSet];

    if (state.controls.isSorted) {
      newSet.sort(nodeSorter);
    } else {
      newSet.sort((a, b) => {
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
      });
    }

    if (state.controls.isOpenOnly) {
      newSet = newSet.filter(
        (item) => item.isOpenForCalculation && !item.isTerminated
      );
    }

    return newSet;
  }, [state]);

  const pagedSet = renderOpenSet.slice(
    (state.controls.pageNum - 1) * PAGE_SIZE,
    state.controls.pageNum * PAGE_SIZE
  );

  const isPrevPageAvailable = state.controls.pageNum > 1;
  const totalPage = Math.ceil(renderOpenSet.length / PAGE_SIZE);
  const isNextPageAvailable = state.controls.pageNum < totalPage;

  return (
    <Container>
      <LeftColumn>
        <MainContent>
          <div>
            <Card>
              <ChessBoard board={board} />
              <Desc>
                <Title>To be moved by</Title>
                <Value>{levelZeroSide}</Value>
              </Desc>
              <Desc>
                <Title>Score</Title>
                <Value>{getBoardWinnerAndScore(board)[1]}</Value>
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
                <Value>{state.openSet.length}</Value>
              </Desc>
              <Desc>
                <Title>Maximum level</Title>
                <Value>{state.maximumLevel}</Value>
              </Desc>
              <Desc>
                <Title>Page</Title>
                <Value>
                  {state.controls.pageNum}/{totalPage}
                </Value>
              </Desc>
              <Desc>
                <Title>
                  <button
                    onClick={() =>
                      setState((old) => ({
                        ...old,
                        controls: {
                          ...old.controls,
                          isOpenOnly: !old.controls.isOpenOnly,
                        },
                      }))
                    }
                  >
                    Open: {`${state.controls.isOpenOnly}`}
                  </button>
                </Title>
                <Value>
                  <button
                    onClick={() =>
                      setState((old) => ({
                        ...old,
                        controls: {
                          ...old.controls,
                          isSorted: !old.controls.isSorted,
                        },
                      }))
                    }
                  >
                    Sorted: {`${state.controls.isSorted}`}
                  </button>
                </Value>
              </Desc>
              <Desc>
                <Title>
                  <button
                    disabled={!isPrevPageAvailable}
                    onClick={() =>
                      isPrevPageAvailable &&
                      setState((old) => ({
                        ...old,
                        controls: {
                          ...old.controls,
                          pageNum: old.controls.pageNum - 1,
                        },
                      }))
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
                      setState((old) => ({
                        ...old,
                        controls: {
                          ...old.controls,
                          pageNum: old.controls.pageNum + 1,
                        },
                      }))
                    }
                  >
                    next
                  </button>
                </Value>
              </Desc>
              <Desc>
                <Title>Simulate</Title>
                <Value>
                  <button onClick={() => handleClick(TIMES)}>run</button>
                </Value>
              </Desc>
            </Card>
          </div>
          <div>
            {prevPointer && (
              <Card>
                <div onClick={() => copyHash(prevPointer.board)}>
                  <ChessBoard board={prevPointer.board} />
                </div>
                <Desc>
                  <Title>To be moved by</Title>
                  <Value>
                    {prevPointer.level % 2 === 0 ? levelZeroSide : levelOneSide}
                  </Value>
                </Desc>
                <Desc>
                  <Title>Score</Title>
                  <Value>{prevPointer.score}</Value>
                </Desc>
                <Desc>
                  <Title>Winner</Title>
                  <Value>{prevPointer.winner}</Value>
                </Desc>
                <Desc>
                  <Title>Level</Title>
                  <Value>{prevPointer.level}</Value>
                </Desc>
                <Desc>
                  <Title>Priority</Title>
                  <Value>{prevPointer.priority}</Value>
                </Desc>
                <Desc>
                  <Title>Is Open</Title>
                  <Value>{`${prevPointer.isOpenForCalculation}`}</Value>
                </Desc>
                <Desc>
                  <Title>Is Terminated</Title>
                  <Value>{`${prevPointer.isTerminated}`}</Value>
                </Desc>
              </Card>
            )}
          </div>
        </MainContent>
        <TabControl>
          {pagedSet.map((node, index) => {
            const selectedSide =
              node.level % 2 === 0 ? levelZeroSide : levelOneSide;

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
