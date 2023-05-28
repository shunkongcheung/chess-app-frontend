import React, { memo, useCallback } from "react";
import styled from "styled-components";

import { ChessBoard, ChessNode, Position } from "../../chess/types";
import ChessPiece from "./ChessPiece";

interface IProps {
  board: ChessBoard;
  handleSelect?: (position: Position) => any;
  selectedChess?: Position;
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: auth;

  background: url("/chess-board.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
`;

const PieceContainer = styled.div<{
  widthPercent: number;
}>`
  display: flex;
  width: ${({ widthPercent }) => widthPercent}%;
  height: 100%;
`;

const ChessBoard = ({ board, handleSelect, selectedChess }: IProps) => {
  const boardWidth = board[0].length;
  const boardHeight = board.length;

  const renderBoardPiece = useCallback(
    (chessNode: ChessNode) => {
      const widthPercent = 100.0 / boardWidth;
      const handleClick = handleSelect
        ? () => handleSelect(chessNode.position)
        : undefined;

      const [rowIdx, colIdx] = chessNode.position;
      const isSelected =
        selectedChess &&
        rowIdx === selectedChess[0] &&
        colIdx === selectedChess[1];

      return (
        <PieceContainer
          key={`boardPiece-${rowIdx}-${colIdx}`}
          widthPercent={widthPercent}
        >
          <ChessPiece
            handleClick={handleClick}
            piece={chessNode.piece}
            side={chessNode.side}
            isSelected={isSelected || false}
          />
        </PieceContainer>
      );
    },
    [boardWidth, selectedChess, handleSelect]
  );

  const renderBoardRow = useCallback(
    (row: Array<ChessNode>, rowIdx) => {
      const rowHeightPercent = 100.0 / boardHeight;
      return (
        <div
          key={`boardRow${rowIdx}`}
          style={{
            display: "flex",
            width: "100%",
            height: `${rowHeightPercent}%`,
          }}
        >
          {row.map((pieceCode: ChessNode) =>
            renderBoardPiece(pieceCode)
          )}
        </div>
      );
    },
    [boardHeight, renderBoardPiece]
  );

  return <Container>{board.map(renderBoardRow)}</Container>;
};

export default memo(ChessBoard);
