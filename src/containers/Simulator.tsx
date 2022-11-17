import React, { useCallback, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

import { getBoardFromHash, getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { Board, Side, BoardNode } from "../types";
import { Card, ChessBoard, Container, ScrollList } from "../components";
import { Payload, Result } from "../pages/api/simulate";
import { getOpenSetFromNetworkOpenSet } from "../utils/NetworkNode";
import { useRouter } from "next/router";

interface IProps {
  board: Board;
  exportTimes: number;
  increment: number;
  toBeMovedBy: Side;
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
  board,
  increment,
  exportTimes,
  toBeMovedBy: levelZeroSide,
}: IProps) => {
  const [state, setState] = useState<Result>({
    openSet: [],
    nextNodes: [],
    runTimes: 0,
    total: 1,
    timeTaken: 0,
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
    ) => {
      const response = await fetchData({
        pageNum,
        isOpenOnly,
        isSorted,
        board,
        levelZeroSide,
        runTimes,
      });
      setState(response);
    },
    [levelZeroSide, board]
  );

  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const isPrevPageAvailable = state.pageNum > 1;
  const totalPage = Math.ceil(state.total / PAGE_SIZE);
  const isNextPageAvailable = state.pageNum < totalPage;

  const { query } = useRouter();
  const getUrl = (board: Board) => {
    const { side, exportTimes, increment } = query;
    const shortHash = getHashFromBoard(board);
    return `/simulate?side=${side}&exportTimes=${exportTimes}&increment=${increment}&shortHash=${shortHash}&`;
  };

  const pointerBoard = state.pointer ? getBoardFromHash(state.pointer.boardHash): [[]];

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
                  ),
                  value: (
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
                  ),
                },
                {
                  title: (
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
                  ),
                  value: (
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
                  ),
                },
                {
                  title: (
                    <button
                      onClick={async () =>
                        await handleClick(1, false, false, exportTimes)
                      }
                    >
                      export
                    </button>
                  ),

                  value: (
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
                <Link href={getUrl(pointerBoard)}>
                  <a>
                    <ChessBoard board={pointerBoard} />
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
            const nodeBoard = getBoardFromHash(node.boardHash);

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
                <Link href={getUrl(nodeBoard)}>
                  <a>
                    <ChessBoard board={nodeBoard} />
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
          listItems={(state.nextNodes || []).map((node, index) => {
            const nodeBoard = getBoardFromHash(node.boardHash);
            return (
            <Card
              key={`NextNode-${index}`}
              descriptions={[
                { title: "Level", value: node.level },
                { title: "Score", value: node.score },
                { title: "Priority", value: node.priority },
              ]}
            >
              <Link href={getUrl(nodeBoard)}>
                <a>
                  <ChessBoard board={nodeBoard} />
                </a>
              </Link>
            </Card>
          )
          })}
        />
      </SecondaryContainer>
    </MyContainer>
  );
};

export default Simulator;
