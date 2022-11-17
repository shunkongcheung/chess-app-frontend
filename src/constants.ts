import { getInitialBoard, getHashFromBoard } from "./chess";

export const DB_FILENAME = "database.sqlite";

export const DEFAULT_RUN_TIMES = 5000;
export const DEFAULT_INCREMENT = 1;
export const INITIAL_HASH = getHashFromBoard(getInitialBoard());

export const PSEUDO_HIGH_PRIORITY = 2497866;
