import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Link from "next/link";

import { Side, Board } from "../types";

import { Container, ChessBoard, Card, ScrollList } from "../components";
import { Payload, Result } from "../pages/api/simulate";
import {
  getBoardFromHash,
  getBoardWinnerAndScore,
  getHashFromBoard,
} from "../chess";
import { NetworkNode } from "../utils/NetworkNode";
import { choiceSorter } from "../simulator";

interface IProps {
  side: Side;
  runTimes: number;
  board: Board;
  nextBoards: Array<Board>;
}

interface IState {
  nextBoardNodes: Array<NetworkNode>;
  runTimes: number;
  status: "loading" | "failed" | "completed";
  isSorted: boolean;
  actualRunTimes: number;
  actualTimeTaken: number;
}

const MyContainer = styled(Container)`
  display: grid;
  grid-template-columns: 4fr 2fr;
  gap: 20px;
  height: 95vh;
`;

const Banner = styled.div`
  color: #d33;
  font-weight: bold;
`;

const fetchData = async (payload: Payload) => {
  const response = await fetch("/api/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as Result;
  return result;
};

const getPlaceholderBoardNodeFromBoard = (board: Board): NetworkNode => {
  const [winner, score] = getBoardWinnerAndScore(board);
  return {
    boardHash: getHashFromBoard(board),
    level: 1,
    index: -1,
    priority: -1,
    score,
    winner,
    isOpenForCalculation: true,
    isTerminated: false,
    relatives: [],
    children: [],
  };
};

const Playground = (props: IProps) => {
  const { side, board, nextBoards } = props;
  const [state, setState] = useState<IState>({
    status: "completed",
    nextBoardNodes: [],
    runTimes: props.runTimes,
    isSorted: true,
    actualRunTimes: -1,
    actualTimeTaken: -1,
  });

  useEffect(() => {
    setState((old) => ({
      ...old,
      nextBoardNodes: nextBoards.map(getPlaceholderBoardNodeFromBoard),
    }));
  }, [nextBoards]);

  useEffect(() => {
    setState((old) => ({
      ...old,
      runTimes: props.runTimes,
    }));
  }, [props.runTimes]);

  const handleRun = useCallback(async () => {
    try {
      setState((old) => ({ ...old, status: "loading" }));
      const response = await fetchData({
        boardHash: getHashFromBoard(board),
        levelZeroSide: side,
        runTimes: state.runTimes,
      });
      setState((old) => ({
        ...old,
        actualRunTimes: response.runTimes,
        actualTimeTaken: response.timeTaken,
        nextBoardNodes: response.levelOneNodes,
        status: "completed",
      }));
    } catch {
      setState((old) => ({ ...old, status: "failed" }));
    }
  }, [side, board, state.runTimes]);

  const nextSide = side === Side.Top ? Side.Bottom : Side.Top;
  const shortHash = getHashFromBoard(board);
  const link = `/simulate?side=${side}&exportTimes=${props.runTimes}&shortHash=${shortHash}`;
  const disabled = state.status !== "completed";
  return (
    <MyContainer>
      <div>
        <Card
          descriptions={[
            ...(state.status === "failed"
              ? [
                  {
                    title: (
                      <Banner>
                        Failed. Try adjusting runTimes to{" "}
                        {Math.ceil(state.runTimes / 2)}
                      </Banner>
                    ),
                    value: "",
                  },
                ]
              : []),
            { title: "side", value: side },
            {
              title: "Run #",
              value: (
                <input
                  disabled={disabled}
                  value={state.runTimes}
                  type="number"
                  min="1"
                  onChange={(evt) => {
                    evt.preventDefault();
                    setState((old) => ({
                      ...old,
                      runTimes: Number(evt.target.value),
                    }));
                  }}
                />
              ),
            },
            {
              title: "Actual time Taken",
              value: `${Math.round(state.actualTimeTaken / 1000)}(s)`,
            },
            { title: "Actual run #", value: state.actualRunTimes },
            {
              title: (
                <button
                  disabled={disabled}
                  onClick={() =>
                    setState((old) => ({ ...old, isSorted: !old.isSorted }))
                  }
                >{`sorted: ${state.isSorted}`}</button>
              ),
              value: (
                <button onClick={handleRun} disabled={disabled}>
                  {state.status === "loading" ? "loading..." : "Run"}
                </button>
              ),
            },
          ]}
        >
          <Link href={link}>
            <a target="_blank" rel="noopener noreferer">
              <ChessBoard board={board} />
            </a>
          </Link>
        </Card>
      </div>
      <ScrollList
        listItems={(state.isSorted
          ? [...state.nextBoardNodes].sort(choiceSorter(side))
          : state.nextBoardNodes
        ).map((boardNode) => (
          <Card
            key={boardNode.boardHash}
            descriptions={[
              { title: "Index", value: boardNode.index },
              { title: "Score", value: boardNode.score },
              { title: "Priority", value: boardNode.priority },
              { title: "Children", value: boardNode.children.length },
            ]}
          >
            <Link
              href={`/playground?side=${nextSide}&runTimes=${state.runTimes}&shortHash=${boardNode.boardHash}`}
            >
              <a>
                <ChessBoard board={getBoardFromHash(boardNode.boardHash)} />
              </a>
            </Link>
          </Card>
        ))}
      />
    </MyContainer>
  );
};

export default Playground;
