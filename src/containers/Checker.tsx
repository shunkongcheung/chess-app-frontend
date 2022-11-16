import React, { useState } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Node, Side } from "../types";
import ChessBoard from "../components/ChessBoard";
import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { nodeSorter } from "../simulator";

interface IProps {
  node: Node;
}

const Container = styled.div`
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;

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

const Checker = ({ node }: IProps) => {
  const { query, push } = useRouter();
  const { side: levelZeroSide } = query;
  const [state, setState] = useState({ isSorted: true });
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const handleClick = (nodeIndex: number) => {
    push(
      `/check?side=${query.side}&shortHash=${query.shortHash}&index=${nodeIndex}`
    );
  };

  return (
    <Container>
      <MainContent>
        <div>
          <Card>
            <ChessBoard board={node.board} />
            <Desc>
              <Title>Level Side</Title>
              <Value>
                {node.level % 2 === 0 ? levelZeroSide : levelOneSide}
              </Value>
            </Desc>
            <Desc>
              <Title>Score</Title>
              <Value>{getBoardWinnerAndScore(node.board)[1]}</Value>
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
            <Desc>
              <Title></Title>
              <Value>
                <button
                  onClick={() =>
                    setState((old) => ({ ...old, isSorted: !old.isSorted }))
                  }
                >
                  {`sorted: ${state.isSorted}`}
                </button>
              </Value>
            </Desc>
          </Card>
        </div>
        <div>
          {node.parent && (
            <Card>
              <div
                onClick={() => node.parent && handleClick(node.parent.index)}
              >
                <ChessBoard board={node.parent.board} />
              </div>
              <Desc>
                <Title>Level Side</Title>
                <Value>
                  {node.parent.level % 2 === 0 ? levelZeroSide : levelOneSide}
                </Value>
              </Desc>
              <Desc>
                <Title>Score</Title>
                <Value>{node.parent.score}</Value>
              </Desc>
              <Desc>
                <Title>Winner</Title>
                <Value>{node.parent.winner}</Value>
              </Desc>
              <Desc>
                <Title>Level</Title>
                <Value>{node.parent.level}</Value>
              </Desc>
              <Desc>
                <Title>Priority</Title>
                <Value>{node.parent.priority}</Value>
              </Desc>
              <Desc>
                <Title>Is Open</Title>
                <Value>{`${node.parent.isOpenForCalculation}`}</Value>
              </Desc>
              <Desc>
                <Title>Is Terminated</Title>
                <Value>{`${node.parent.isTerminated}`}</Value>
              </Desc>
            </Card>
          )}
        </div>
      </MainContent>
      <TabControl>
        {(state.isSorted
          ? [...node.children].sort(nodeSorter)
          : node.children
        ).map((node, index) => {
          const selectedSide =
            node.level % 2 === 0 ? levelZeroSide : levelOneSide;

          return (
            <TabItem key={getHashFromBoard(node.board)}>
              <Card>
                <div onClick={() => handleClick(node.index)}>
                  <ChessBoard board={node.board} />
                </div>
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
    </Container>
  );
};

export default Checker;
