import { getInitialBoard, getHashFromBoard } from "./chess";

export const DEFAULT_MAXIMUM_LEVEL = 5;
export const DEFAULT_RUN_TIMES = 5000;
export const DEFAULT_INCREMENT = 1;
export const INITIAL_HASH = getHashFromBoard(getInitialBoard());
