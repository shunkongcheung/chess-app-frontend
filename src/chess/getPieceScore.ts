import { Piece } from "../types";

const getPieceScore = (piecePrefix: string) => {
  const piecePrefixUpper = piecePrefix.toUpperCase() as Piece;
  const pieceScore = {
    [Piece.EMPTY]: 0,
    [Piece.SOLDIER]: 2,
    [Piece.JUMBO]: 4,
    [Piece.KNIGHT]: 4,
    [Piece.CANNON]: 7,
    [Piece.HORSE]: 6,
    [Piece.CASTLE]: 9,
    [Piece.GENERAL]: 10,
  };

  const value = pieceScore[piecePrefixUpper];
  return piecePrefixUpper === piecePrefix ? value : -value;
};

export default getPieceScore;
