import React from "react";
import styled from "styled-components";
import Link from "next/link";

import { Board, Side } from "../types";
import ChessBoard from "../components/ChessBoard";
import {
  getAllNextPositions,
  getBoardWinnerAndScore,
  getHashFromBoard,
  getMovedBoard,
} from "../chess";

interface IProps {
  board: Board;
  toBeMovedBy: Side;
}

const Container = styled.div`
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: space-between;
`;

const Card = styled.ul`
  width: 50%;
  max-width: 500px;
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

const TabContainer = styled.div`
  width: 45%;
  max-width: 500px;
`;

const TabContent = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;

  max-height: 80vh;
  overflow-y: auto;
`;

const TabControl = styled.div`
  display: flex;
`;

const TabItem = styled.div`
  width: 45%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-bottom: 2px;
`;

const ChessBoardDetail = ({ board, toBeMovedBy }: IProps) => {
  const shortHash = getHashFromBoard(board);
  const [winner, score] = getBoardWinnerAndScore(board);
  const tos = getAllNextPositions(board, toBeMovedBy === Side.Top);
  const nextSide = toBeMovedBy === Side.Top ? Side.Bottom : Side.Top;

  return (
    <Container>
      <Card>
        <ChessBoard board={board} />
        <Desc>
          <Title>To be moved by</Title>
          <Value>{toBeMovedBy}</Value>
        </Desc>
        <Desc>
          <Title>Hash</Title>
          <Value>{shortHash}</Value>
        </Desc>
        <Desc>
          <Title>Winner</Title>
          <Value>{winner}</Value>
        </Desc>
        <Desc>
          <Title>Score</Title>
          <Value>{score}</Value>
        </Desc>
      </Card>
      <TabContainer>
        <TabControl>
          <TabContent>
            {(tos || []).map((chessMove, idx) => {
              const nextBoard = getMovedBoard(
                board,
                chessMove.from,
                chessMove.to
              );
              const shortHash = getHashFromBoard(nextBoard);
              return (
                <TabItem key={`To-${shortHash}-${idx}`}>
                  <Link href={`/${nextSide}/${shortHash}`}>
                    <a>
                      <ChessBoard board={nextBoard} />
                    </a>
                  </Link>
                </TabItem>
              );
            })}
          </TabContent>
        </TabControl>
      </TabContainer>
    </Container>
  );
};

export default ChessBoardDetail;
