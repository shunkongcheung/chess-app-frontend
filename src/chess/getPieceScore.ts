import { Piece } from "../types";

const getPieceScore = (piecePrefix: string) => {
  const piecePrefixUpper = piecePrefix.toUpperCase() as Piece;
  const pieceScore = [
    Piece.EMPTY,
    Piece.SOLDIER,
    Piece.JUMBO,
    Piece.KNIGHT,
    Piece.CANNON,
    Piece.HORSE,
    Piece.CASTLE,
    Piece.GENERAL,
  ];

  const pieceIndex = pieceScore.indexOf(piecePrefixUpper);
  return piecePrefixUpper === piecePrefix ? pieceIndex : -pieceIndex;
};

export default getPieceScore;
