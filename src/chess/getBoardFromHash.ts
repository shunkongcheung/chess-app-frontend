import { Board } from "../types";

const getBoardFromHash = (boardHash: string): Board => {
  const [HEIGHT, WIDTH] = [10, 9];
  const board: Board = [];

  for (let rowIdx = 0; rowIdx < HEIGHT; rowIdx++) {
    const row = boardHash.slice(rowIdx * WIDTH, (rowIdx + 1) * WIDTH).split("");
    board.push(row);
  }

  return board;
};

export default getBoardFromHash;
