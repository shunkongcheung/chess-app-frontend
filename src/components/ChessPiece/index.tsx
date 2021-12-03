import React, { memo, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";

interface ChessPieceProps {
  pieceCode: string;
  handleClick?: () => any;
  isSelected: boolean;
}

const jump = keyframes`
    0% {
			transform:0;
    }
    100% {
			transform: translate(0, -10px);
    }
`;

const Container = styled.img<{ disable: boolean; isSelected: boolean }>`
  width: 100%;
  height: 100%;
  cursor: ${({ disable }) => (disable ? "auto" : "pointer")};

  animation: ease-in ${({ isSelected }) => (isSelected ? jump : "")} 0.7s
    infinite;
`;

const ChessPiece: React.FC<ChessPieceProps> = ({
  pieceCode,
  handleClick,
  isSelected,
}) => {
  const getPieceOffset = useCallback((pieceCode: string) => {
    const codeOrder = ["g", "k", "j", "c", "h", "a", "s"];
    return codeOrder.findIndex((item) => item === pieceCode);
  }, []);

  const background = useMemo(() => {
    let [hOffset, vOffset] = [0, 0];
    const pLower = pieceCode.toLowerCase();
    if (pieceCode === pLower) vOffset = 100;
    hOffset = getPieceOffset(pLower);

    const bgPosition = `${(100.0 / 7 + 2.4) * hOffset}% ${vOffset}%`;
    const bgSize = "700% 200%";
    const background =
      hOffset >= 0 ? `url("/chess-pieces.png") ${bgPosition} / ${bgSize}` : "";

    return background;
  }, [getPieceOffset, pieceCode]);

  return (
    <Container
      disable={!handleClick}
      isSelected={isSelected}
      alt="chess-piece"
      src={"/trans.gif"}
      style={{ background }}
      onClick={handleClick}
    ></Container>
  );
};

export default memo(ChessPiece);
