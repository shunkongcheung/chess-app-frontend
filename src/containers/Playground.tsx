import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { Board, Side } from "../types";
import { NetworkNode } from "../utils/NetworkNode";
import { Card, ChessBoard, Container } from "../components";

import { Payload, Result } from "../pages/api/simulate";
import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";

interface IProps {
  board: Board;
  side: Side;
  runTimes: number;
}

interface IState {
  records: Array<Array<NetworkNode>>;
  timeTaken: number;
  side: Side;
}

const Main = styled.div`
  width: 500px;
`;

const copyHash = (board: Board) => {
  const text = getHashFromBoard(board);
  navigator.clipboard.writeText(text);
};

const Playground = ({ board, side, runTimes }: IProps) => {
  const [state, setState] = useState<IState>(() => {
    const [winner, score] = getBoardWinnerAndScore(board);
    return {
      side,
      timeTaken: 0,
      records: [
        [
          {
            board,
            index: 0,
            children: [],
            relatives: [],
            score,
            winner,
            level: 0,
            priority: 0,
            isOpenForCalculation: true,
            isTerminated: false,
          },
        ],
      ],
    };
  });

  const handleRun = useCallback(async () => {
    const board = state.records[0][0].board;
    const payload: Payload = {
      levelZeroSide: state.side,
      runTimes,
      board,
    };

    const response = await fetch("/api/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const { timeTaken, levelOneNodes } = (await response.json()) as Result;
    setState({
      timeTaken,
      records: [levelOneNodes, ...state.records],
      side: state.side === Side.Top ? Side.Bottom : Side.Top,
    });
  }, [state, runTimes]);

  const handleBack = useCallback(() => {
    setState((oldState) => ({
      timeTaken: 0,
      records: [...oldState.records].slice(1),
      side: oldState.side === Side.Top ? Side.Bottom : Side.Top,
    }));
  }, []);

  return (
    <Container>
      <Main>
        <Card
          descriptions={[
            { title: "Run", value: runTimes },
            { title: "Side", value: state.side },
            { title: "Time taken", value: `${state.timeTaken}ms` },
            {
              title: <button onClick={handleBack}>back</button>,
              value: <button onClick={handleRun}>next</button>,
            },
          ]}
        >
          <div onClick={() => copyHash(state.records[0][0].board)}>
            <ChessBoard board={state.records[0][0].board} />
          </div>
        </Card>
      </Main>
    </Container>
  );
};

export default Playground;
