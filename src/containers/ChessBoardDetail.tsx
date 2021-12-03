import React from "react";
import styled from 'styled-components';
import Link from "next/link"

import { Board, Side } from "../types";
import ChessBoard from '../components/ChessBoard';
import {fetchChessBoard} from '../utils';

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
box-shadow: 0 4px 10px 0 rgba(0,0,0,0.2),0 4px 20px 0 rgba(0,0,0,0.19);
list-style: none;
padding: 0;
margin: 0;
`;

const Desc = styled.li `
display: flex;
justify-content: space-between;
padding: 5px;
border-bottom: 1px solid #eee;
`;

const Title = styled.div `
font-weight: bold;
`;

const Value = styled.div ``;

const TabContainer = styled.div `
width: 45%;
max-width: 500px;
`;

const TabContent = styled.div `
width: 100%;
display: flex;
flex-wrap: wrap;

max-height: 80vh;
overflow-y: auto;
`

const TabControl = styled.div `
display: flex;
`;

const TabItem = styled.div `
width: 45%;
margin-left: 2.5%;
margin-right: 2.5%;
margin-bottom: 2px;
`;

const TabBtn = styled.button<{active: boolean}> `
background: transparent;
border: 1px solid #eee;
border-top-left-radius: 3px;
border-top-right-radius: 3px;
padding: 5px;
width: 50%;
color: #777;
font-weight: 500;

&:hover {
  color: #333;
  cursor: pointer;
}
${({ active }: any) => active ? "font-weight: bold;": ""}
${({ active }: any) => active ? "color: #222;": ""}
${({ active }: any) => active ? "border-color: #aaa;": ""}
`;

interface ChessMove {
  fromRow: number;
  fromCol: number;
  fromPiece: string;

  toRow: number;
  toCol: number;
  toPiece: string;

  movedBy: Side;
  qScore: number;
  fromBoard: ChessBoard;
  toBoard: ChessBoard;
}

interface ChessBoard {
  id: number;
  board: Board;
  shortHash: string;
  score: number;
  toBeMovedBy: Side;
  froms?: Array<ChessMove>;
  tos?: Array<ChessMove>;
}

interface ChessBaordDetailProps {
  chessBoard: ChessBoard
}

const ChessBoardDetail = ({ chessBoard }: ChessBaordDetailProps) => {
  const [selected, setSelected] = React.useState("from");
  console.log('hey here', chessBoard.froms)
  return (
    <Container>
      <Card>
        <ChessBoard
          board={chessBoard.board}
        />
        <Desc>
          <Title>To be moved by</Title>
          <Value>{chessBoard.toBeMovedBy}</Value>
        </Desc>
        <Desc>
          <Title>Hash</Title>
          <Value>{chessBoard.shortHash}</Value>
        </Desc>
        <Desc>
          <Title>Score</Title>
          <Value>{chessBoard.score}</Value>
        </Desc>
      </Card>
      <TabContainer>
        <TabBtn 
          active={selected === "from"}
          onClick={() => setSelected("from")}
        >
          From
        </TabBtn>
        <TabBtn 
          active={selected === "to"}
          onClick={() => setSelected("to")}
        >
          To
        </TabBtn>
        <TabControl>
          <TabContent>
            {selected === "from" ? 
              (chessBoard.froms || [])
            .map((chessMove) => 
              <TabItem>
                <Link href={`/${chessMove.fromBoard.shortHash}`}>
                  <a>
                    <ChessBoard board={chessMove.fromBoard.board}/>
                  </a>
                </Link>
              </TabItem>
                ):
                  (chessBoard.tos || [])
                .map((chessMove) => 
                  <TabItem>
                    <Link href={`/${chessMove.toBoard.shortHash}`}>
                      <a>
                        <ChessBoard board={chessMove.toBoard.board}/>
                      </a>
                    </Link>
                  </TabItem>
                    )


            }
          </TabContent>
        </TabControl>
      </TabContainer>
    </Container>
  )
}

export default ChessBoardDetail
