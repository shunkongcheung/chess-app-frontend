import React, { memo, useCallback } from "react";
import styled from "styled-components";

import { Board, Position } from '../../types'
import ChessPiece from "../ChessPiece";

interface ChessBoardProps {
  board: Board;
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

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  handleSelect,
  selectedChess,
}) => {
  const boardWidth = board[0].length;
  const boardHeight = board.length;

  const renderBoardPiece = useCallback(
    (pieceCode: string, rowIdx: number, colIdx: number) => {
      const widthPercent = 100.0 / boardWidth;
      const handleClick = handleSelect
        ? () => handleSelect([rowIdx, colIdx])
        : undefined;

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
            pieceCode={pieceCode}
            isSelected={isSelected || false}
          />
        </PieceContainer>
      );
    },
    [boardWidth, selectedChess]
  );

  const renderBoardRow = useCallback(
    (row: Array<string>, rowIdx) => {
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
          {row.map((pieceCode, colIdx: number) =>
            renderBoardPiece(pieceCode, rowIdx, colIdx)
          )}
        </div>
      );
    },
    [boardHeight, renderBoardPiece]
  );

  return <Container>{board.map(renderBoardRow)}</Container>;
};

export default memo(ChessBoard);
