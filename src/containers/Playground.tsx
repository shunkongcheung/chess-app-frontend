import React, {useCallback, useState} from "react";
import styled from "styled-components";

import { Board, Side } from "../types";
import { NetworkNode } from "../utils/NetworkNode";
import ChessBoard from "../components/ChessBoard";

import { Payload, Result } from "../pages/api/simulate";
import {getBoardWinnerAndScore, getHashFromBoard } from "../chess";

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

const Container = styled.div `
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.2rem;
  flex-wrap: wrap;
`

const MoveList = styled.ul `
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 0.2rem;
  height: 100%;
  overflow: auto;
`

const MoveItem = styled.li `
  padding: .7rem 1.5rem;
  border-bottom: 1px solid #ccc;
  :last-of-type {
    border-bottom: 0px;
  }
`

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

const Title = styled.div`
  font-weight: bold;
`;

const Value = styled.div``;


const copyHash = (board: Board) => {
  const text = getHashFromBoard(board);
  navigator.clipboard.writeText(text);
};

const Playground = ({ board, side, runTimes }: IProps) => {
  const [state, setState] = useState<IState>(() => {
    const [winner, score] = getBoardWinnerAndScore(board)
    return {
      side,
      timeTaken: 0,
      records: [
        [{
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
        }]
      ]
    }
  })

  const handleRun = useCallback(async () => {
    const board = state.records[0][0].board;
    const [winner, score] = getBoardWinnerAndScore(board)
    const payload: Payload = {
      levelZeroSide: state.side,
      runTimes,
      openSet: [{
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
      }],
    }

    const response = await fetch("/api/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const { timeTaken, levelOneNodes } = (await response.json()) as Result;
    setState({ 
      timeTaken,
      records: [levelOneNodes, ...state.records],
      side: state.side === Side.Top ? Side.Bottom : Side.Top
    })
  }, [state, runTimes])

  const handleBack = useCallback(() => {
    setState(oldState => ({ 
      timeTaken: 0,
      records: [...oldState.records].slice(1),
      side: oldState.side === Side.Top ? Side.Bottom : Side.Top
    }))
  }, []);

  return (
    <Container>
      <Card>
        <div onClick={() => copyHash(state.records[0][0].board)}>
          <ChessBoard board={state.records[0][0].board}/>
        </div>
        <Desc>
          <Title>Run</Title>
          <Value>{runTimes}</Value>
        </Desc>
        <Desc>
          <Title>Side</Title>
          <Value>{state.side}</Value>
        </Desc>
        <Desc>
          <Title>Time taken</Title>
          <Value>{state.timeTaken}ms</Value>
        </Desc>
        <Desc>
          <Title><button onClick={handleBack}>back</button></Title>
          <Value><button onClick={handleRun}>next</button></Value>
        </Desc>
      </Card>
    </Container>
  );
}

export default Playground;
