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

interface IProps {
  side: Side;
  runTimes: number;
  board: Board;
  nextBoards: Array<Board>;
}

const MyContainer = styled(Container)`
  display: grid;
  grid-template-columns: 4fr 2fr;
  gap: 20px;
  height: 95vh;
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
  const [nextBoardNodes, setNextBoardNodes] = useState<Array<NetworkNode>>([]);
  const [runTimes, setRunTimes] =  useState<number>(props.runTimes);

  useEffect(() => {
    setNextBoardNodes(nextBoards.map(getPlaceholderBoardNodeFromBoard));
  }, [nextBoards]);

  useEffect(() => {
    setRunTimes(props.runTimes)
  }, [props.runTimes]);

  const handleRun = useCallback(async () => {
    const response = await fetchData({
      boardHash: getHashFromBoard(board),
      levelZeroSide: side,
      runTimes,
    });
    setNextBoardNodes(response.levelOneNodes);
  }, [side, board, runTimes]);

  const nextSide = side === Side.Top ? Side.Bottom : Side.Top;
  const shortHash = getHashFromBoard(board);
  const link = `/simulate?side=${side}&exportTimes=${runTimes}&shortHash=${shortHash}`;
  return (
    <MyContainer>
      <div>
        <Card
          descriptions={[
            { title: "side", value: side },
            { title: "Run #", 
              value: <input value={runTimes}
                type="number"
                min="1"
                onChange={evt => {
                  evt.preventDefault();
                  setRunTimes(Number(evt.target.value));

                }} 
              />
            },
            { title: "run", value: <button onClick={handleRun}>Run</button> },
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
        listItems={nextBoardNodes.map((boardNode) => (
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
              href={`/playground?side=${nextSide}&runTimes=${runTimes}&shortHash=${boardNode.boardHash}`}
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
