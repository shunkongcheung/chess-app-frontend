import getIsPieceEmpty from "./getIsPieceEmpty";
import { ChessNode } from "./types";

const getIsPieceFriendly = (curPiece: ChessNode, nextPiece: ChessNode) => {
  if (getIsPieceEmpty(nextPiece)) return false;
  return curPiece.side === nextPiece.side;
};
export default getIsPieceFriendly;
