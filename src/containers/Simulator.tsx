import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

import { getBoardWinnerAndScore, getBoardFromHash } from "../chess";
import { Side, BoardNode } from "../types";
import { Card, ChessBoard, Container, ScrollList } from "../components";
import { Payload, Result } from "../pages/api/simulate";
import { getOpenSetFromNetworkOpenSet } from "../utils/NetworkNode";
import { useRouter } from "next/router";

interface IProps {
  boardHash: string;
  exportTimes: number;
  increment: number;
  toBeMovedBy: Side;
}

interface State extends Omit<Result, "pointer" | "nextNodes" | "openSet"> {
  pointer?: BoardNode;
  openSet: Array<BoardNode>;
  nextNodes: Array<BoardNode>; // debug only
}

const MyContainer = styled(Container)`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: 30px;
`;

const LeftColumn = styled.div`
  display: grid;
  grid-template-rows: 3fr 3fr;
  height: 95vh;
`;

const SecondaryContainer = styled.div`
  height: 95vh;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-right: auto;
`;

const PAGE_SIZE = 50;

const fetchData = async (payload: Payload) => {
  const response = await fetch("/api/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as Result;
  return result;
};

const Simulator = ({
  boardHash,
  increment,
  exportTimes,
  toBeMovedBy: levelZeroSide,
}: IProps) => {
  const [state, setState] = useState<State>({
    openSet: [],
    nextNodes: [],
    levelOneNodes: [],
    runTimes: 0,
    total: 1,
    timeTaken: 0,
    pageNum: 1,
    pageSize: 1,
    isExport: false,
    isOpenOnly: false,
    isSorted: false,
  });

  useEffect(() => {
    setState({
      openSet: [],
      nextNodes: [],
      levelOneNodes: [],
      runTimes: 0,
      total: 1,
      timeTaken: 0,
      pageNum: 1,
      pageSize: 1,
      isExport: false,
      isOpenOnly: false,
      isSorted: false,
    });
  }, [boardHash]);

  const handleClick = useCallback(
    async (
      pageNum: number,
      isOpenOnly: boolean,
      isSorted: boolean,
      runTimes: number,
      isExport = false
    ) => {
      const response = await fetchData({
        pageNum,
        isOpenOnly,
        isSorted,
        boardHash,
        levelZeroSide,
        runTimes,
        isExport,
      });
      const newOpenSet = getOpenSetFromNetworkOpenSet(response.openSet);
      setState((oldState) => ({
        ...oldState,
        ...response,
        pointer: response.pointer
          ? (response.pointer as unknown as BoardNode)
          : undefined,
        openSet: newOpenSet,
        nextNodes: getOpenSetFromNetworkOpenSet(response.nextNodes),
      }));
    },
    [levelZeroSide, boardHash]
  );

  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const isPrevPageAvailable = state.pageNum > 1;
  const totalPage = Math.ceil(state.total / PAGE_SIZE);
  const isNextPageAvailable = state.pageNum < totalPage;

  const { query } = useRouter();
  const getUrl = (shortHash: string, isSideSwitched = true) => {
    const { side, exportTimes, increment } = query;
    const newSide = isSideSwitched
      ? side === Side.Top
        ? Side.Bottom
        : Side.Top
      : side;
    return `/simulate?side=${newSide}&exportTimes=${exportTimes}&increment=${increment}&shortHash=${shortHash}&`;
  };

  const board = getBoardFromHash(boardHash);
  return (
    <MyContainer>
      <LeftColumn>
        <MainContent>
          <div>
            <Card
              descriptions={[
                { title: "Level side", value: levelZeroSide },
                { title: "Score", value: getBoardWinnerAndScore(board)[1] },
                { title: "#", value: state.runTimes },
                { title: "Time", value: state.timeTaken },
                { title: "Count", value: state.total },
                { title: "Page", value: `${state.pageNum}/${totalPage}` },
                {
                  title: (
                    <button
                      onClick={useCallback(
                        () =>
                          setState((old) => {
                            handleClick(
                              old.pageNum,
                              !old.isOpenOnly,
                              old.isSorted,
                              old.runTimes
                            );
                            return old;
                          }),
                        [handleClick]
                      )}
                    >
                      Open: {`${state.isOpenOnly}`}
                    </button>
                  ),
                  value: (
                    <button
                      onClick={useCallback(
                        () =>
                          setState((old) => {
                            handleClick(
                              old.pageNum,
                              old.isOpenOnly,
                              !old.isSorted,
                              old.runTimes
                            );
                            return old;
                          }),
                        [handleClick]
                      )}
                    >
                      Sorted: {`${state.isSorted}`}
                    </button>
                  ),
                },
                {
                  title: (
                    <button
                      disabled={!isPrevPageAvailable}
                      onClick={useCallback(
                        () =>
                          isPrevPageAvailable &&
                          setState((old) => {
                            handleClick(
                              old.pageNum - 1,
                              old.isOpenOnly,
                              old.isSorted,
                              old.runTimes
                            );
                            return old;
                          }),
                        [isPrevPageAvailable, handleClick]
                      )}
                    >
                      prev
                    </button>
                  ),
                  value: (
                    <button
                      disabled={!isNextPageAvailable}
                      onClick={useCallback(
                        () =>
                          isNextPageAvailable &&
                          setState((old) => {
                            handleClick(
                              old.pageNum + 1,
                              old.isOpenOnly,
                              old.isSorted,
                              old.runTimes
                            );
                            return old;
                          }),
                        [isNextPageAvailable, handleClick]
                      )}
                    >
                      next
                    </button>
                  ),
                },
                {
                  title: (
                    <button
                      onClick={useCallback(
                        () => handleClick(1, false, false, exportTimes, true),
                        [handleClick, exportTimes]
                      )}
                    >
                      export
                    </button>
                  ),

                  value: (
                    <button
                      onClick={useCallback(
                        () =>
                          setState((old) => {
                            handleClick(
                              old.pageNum,
                              old.isOpenOnly,
                              old.isSorted,
                              old.runTimes + increment
                            );
                            return old;
                          }),
                        [handleClick, increment]
                      )}
                    >
                      run
                    </button>
                  ),
                },
              ]}
            >
              <ChessBoard board={board} />
            </Card>
          </div>
          <div>
            {state.pointer && (
              <Card
                descriptions={[
                  {
                    title: "Level Side",
                    value:
                      state.pointer.level % 2 === 0
                        ? levelZeroSide
                        : levelOneSide,
                  },
                  { title: "Score", value: state.pointer.score },
                  { title: "Winner", value: state.pointer.winner },
                  { title: "Level", value: state.pointer.level },
                  { title: "Priority", value: state.pointer.priority },
                  {
                    title: "Is Open",
                    value: `${state.pointer.isOpenForCalculation}`,
                  },
                  {
                    title: "Is Terminated",
                    value: `${state.pointer.isTerminated}`,
                  },
                ]}
              >
                <Link href={getUrl(state.pointer.boardHash)}>
                  <a>
                    <ChessBoard
                      board={getBoardFromHash(state.pointer.boardHash)}
                    />
                  </a>
                </Link>
              </Card>
            )}
          </div>
        </MainContent>
        <ScrollList
          columns={4}
          listItems={state.openSet.map((node) => {
            const selectedSide =
              node.level % 2 === 0 ? levelZeroSide : levelOneSide;

            return (
              <Card
                key={`ScrollListItem-${node.index}`}
                descriptions={[
                  { title: "Index", value: node.index },
                  { title: "Level Side", value: selectedSide },
                  { title: "Score", value: node.score },
                  { title: "Winner", value: node.winner },
                  { title: "Level", value: node.level },
                  { title: "Priority", value: node.priority },
                  { title: "Is Open", value: `${node.isOpenForCalculation}` },
                  { title: "Is Terminated", value: `${node.isTerminated}` },
                ]}
              >
                <Link href={getUrl(node.boardHash)}>
                  <a>
                    <ChessBoard board={getBoardFromHash(node.boardHash)} />
                  </a>
                </Link>
              </Card>
            );
          })}
        />
      </LeftColumn>
      <SecondaryContainer>
        <ScrollList
          columns={1}
          listItems={state.levelOneNodes.map((node, index) => (
            <Card
              key={`NextNode-${index}`}
              descriptions={[
                { title: "Level", value: node.level },
                { title: "Score", value: node.score },
                { title: "Priority", value: node.priority },
                { title: "Children #", value: node.children.length },
              ]}
            >
              <Link href={getUrl(node.boardHash)}>
                <a>
                  <ChessBoard board={getBoardFromHash(node.boardHash)} />
                </a>
              </Link>
            </Card>
          ))}
        />
      </SecondaryContainer>
    </MyContainer>
  );
};

export default Simulator;
