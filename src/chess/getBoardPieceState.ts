import { Board } from "../types";

import getNonEmptyPieceCount from "./getNonEmptyPieceCount";
import { ONE_THIRD_PIECE_COUNT } from "./constants";
import { BoardPieceCount } from "./types";

const getBoardPieceState = (board: Board) => {
  const count = getNonEmptyPieceCount(board);
  let countState = BoardPieceCount.GteTwoThird;

  if (count < ONE_THIRD_PIECE_COUNT * 1) {
    countState = BoardPieceCount.LtOneThird;
  } else if (count < ONE_THIRD_PIECE_COUNT * 2) {
    countState = BoardPieceCount.LtTwoThird;
  }

  return countState;
};

export default getBoardPieceState;
