import { Piece } from "../types";
import { ChessNode } from "./types"

const getIsPieceEmpty = (chessNode: ChessNode): boolean => chessNode.piece == Piece.EMPTY;

export default getIsPieceEmpty;
