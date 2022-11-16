import React, { useState } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Node, Side } from "../types";
import { Container, Card, ChessBoard, ScrollList } from "../components";
import { getBoardWinnerAndScore, getHashFromBoard } from "../chess";
import { nodeSorter } from "../simulator";

interface IProps {
  node: Node;
}

const MainContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-right: auto;
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

  const filteredChildren = state.isSorted
    ? [...node.children].sort(nodeSorter)
    : node.children;

  return (
    <Container>
      <MainContent>
        <div>
          <Card
            descriptions={[
              {
                title: "Level Side",
                value: node.level % 2 === 0 ? levelZeroSide : levelOneSide,
              },
              { title: "Score", value: getBoardWinnerAndScore(node.board)[1] },
              { title: "Winner", value: node.winner },
              { title: "Level", value: node.level },
              { title: "Priority", value: node.priority },
              { title: " Is Open", value: `${node.isOpenForCalculation}` },
              { title: " Is Terminated", value: `${node.isTerminated}` },
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
            <ChessBoard board={node.board} />
          </Card>
        </div>
        <div>
          {node.parent && (
            <Card
              descriptions={[
                {
                  title: "Level Side",
                  value:
                    node.parent.level % 2 === 0 ? levelZeroSide : levelOneSide,
                },
                { title: "Score", value: node.parent.score },
                { title: "Winner", value: node.parent.winner },
                { title: "Level", value: node.parent.level },
                { title: "Priority", value: node.parent.priority },
                {
                  title: "Is Open",
                  value: `${node.parent.isOpenForCalculation}`,
                },
                {
                  title: "Is Terminated",
                  value: `${node.parent.isTerminated}`,
                },
              ]}
            >
              <div
                onClick={() => node.parent && handleClick(node.parent.index)}
              >
                <ChessBoard board={node.parent.board} />
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
