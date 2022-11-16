import React, { useState } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Node, Side } from "../types";
import { Container, Card, ChessBoard, ScrollList } from "../components";
import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { nodeSorter } from "../simulator";

interface IProps {
  currentNode: Node;
  levelZeroNode: Node;
  highestPriority: number;
  maximumLevel: number;
  maxReachedLevel: number;
  runTimes: number;
}

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-right: auto;
`;

const Checker = ({
  currentNode,
  highestPriority,
  levelZeroNode,
  maxReachedLevel,
  maximumLevel,
  runTimes,
}: IProps) => {
  const { query, push } = useRouter();
  const { side: levelZeroSide } = query;
  const [state, setState] = useState({ isSorted: true });
  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;

  const handleClick = (nodeIndex: number) => {
    push(
      `/check?side=${query.side}&shortHash=${query.shortHash}&index=${nodeIndex}`
    );
  };

  const filteredChildren = state.isSorted
    ? [...currentNode.children].sort(nodeSorter)
    : currentNode.children;

  return (
    <Container>
      <MainContent>
        <div>
          <Card
            descriptions={[
              {
                title: "Score",
                value: getBoardWinnerAndScore(levelZeroNode.board)[1],
              },
              {
                title: "Is Open",
                value: `${levelZeroNode.isOpenForCalculation}`,
              },
              {
                title: "Is Terminated",
                value: `${levelZeroNode.isTerminated}`,
              },
              { title: "--------", value: "" },
              { title: "Maximum level", value: `${maximumLevel}` },
              { title: "Max. Level Reached", value: `${maxReachedLevel}` },
              { title: "--------", value: "" },
              { title: "Run Times", value: `${runTimes}` },
              { title: "Highest Priority", value: `${highestPriority}` },
              {
                title: "",
                value: (
                  <button
                    onClick={() =>
                      setState((old) => ({ ...old, isSorted: !old.isSorted }))
                    }
                  >
                    {`sorted: ${state.isSorted}`}
                  </button>
                ),
              },
            ]}
          >
            <ChessBoard board={levelZeroNode.board} />
          </Card>
        </div>
        <div>
          <Card
            descriptions={[
              {
                title: "Level Side",
                value:
                  currentNode.level % 2 === 0 ? levelZeroSide : levelOneSide,
              },
              {
                title: "Score",
                value: getBoardWinnerAndScore(currentNode.board)[1],
              },
              { title: "Winner", value: currentNode.winner },
              { title: "Level", value: currentNode.level },
              { title: "Priority", value: currentNode.priority },
              {
                title: "Is Open",
                value: `${currentNode.isOpenForCalculation}`,
              },
              { title: "Is Terminated", value: `${currentNode.isTerminated}` },
            ]}
          >
            <ChessBoard board={currentNode.board} />
          </Card>
        </div>
        <div>
          {currentNode.parent && (
            <Card
              descriptions={[
                {
                  title: "Level Side",
                  value:
                    currentNode.parent.level % 2 === 0
                      ? levelZeroSide
                      : levelOneSide,
                },
                { title: "Score", value: currentNode.parent.score },
                { title: "Winner", value: currentNode.parent.winner },
                { title: "Level", value: currentNode.parent.level },
                { title: "Priority", value: currentNode.parent.priority },
                {
                  title: "Is Open",
                  value: `${currentNode.parent.isOpenForCalculation}`,
                },
                {
                  title: "Is Terminated",
                  value: `${currentNode.parent.isTerminated}`,
                },
              ]}
            >
              <div
                onClick={() =>
                  currentNode.parent && handleClick(currentNode.parent.index)
                }
              >
                <ChessBoard board={currentNode.parent.board} />
              </div>
            </Card>
          )}
        </div>
      </MainContent>
      <ScrollList
        columns={4}
        listItems={[
          filteredChildren.map((node) => {
            const selectedSide =
              node.level % 2 === 0 ? levelZeroSide : levelOneSide;

            return (
              <Card
                key={getHashFromBoard(node.board)}
                descriptions={[
                  { title: "Level Side", value: selectedSide },
                  { title: "Score", value: node.score },
                  { title: "Winner", value: node.winner },
                  { title: "Level", value: node.level },
                  { title: "Priority", value: node.priority },
                  { title: "Is Open", value: `${node.isOpenForCalculation}` },
                  { title: "Is Terminated", value: `${node.isTerminated}` },
                ]}
              >
                <div onClick={() => handleClick(node.index)}>
                  <ChessBoard board={node.board} />
                </div>
              </Card>
            );
          }),
        ]}
      />
    </Container>
  );
};

export default Checker;
