import { gql } from "@apollo/client";

import getApolloClient from "./getApolloClient";

import { Board, Piece, Side } from "../types";

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

const ChessBoard = gql`
  query ChessBoard($shortHash: String!) {
    chessBoard(shortHash: $shortHash) {
      id
      board
      shortHash
      score
      toBeMovedBy

      froms {
        fromRow
        fromCol
        fromPiece
        toRow
        toCol
        toPiece
        movedBy
        qScore
        fromBoard {
          id
          board
          shortHash
          score
          toBeMovedBy
        }
        toBoard {
          id
          board
          shortHash
          score
          toBeMovedBy
        }
      }

      tos {
        fromRow
        fromCol
        fromPiece
        toRow
        toCol
        toPiece
        movedBy
        qScore
        fromBoard {
          id
          board
          shortHash
          score
          toBeMovedBy
        }
        toBoard {
          id
          board
          shortHash
          score
          toBeMovedBy
        }
      }
    }
  }
`;

const fetchChessBoard = async (shortHash: string) => {
  const client = getApolloClient();
  const { data } = await client.query<{ chessBoard: ChessBoard }>({
    query: ChessBoard,
    variables: { shortHash },
  });
  return data.chessBoard;
};

export default fetchChessBoard;
