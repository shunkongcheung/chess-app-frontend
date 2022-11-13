import { Board } from "../types";

const getHashFromBoard = (board: Board): string => {
  return board.map((row) => row.join("")).join("");
};

export default getHashFromBoard;
