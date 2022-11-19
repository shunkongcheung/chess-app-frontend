import getInitialBoard from "./getInitialBoard";
import getNonEmptyPieceCount from "./getNonEmptyPieceCount";

export const TOTAL_PIECE_COUNT = getNonEmptyPieceCount(getInitialBoard());

export const ONE_THIRD_PIECE_COUNT = Math.ceil(TOTAL_PIECE_COUNT / 3);
