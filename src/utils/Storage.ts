import { promises } from "fs";
import path from "path";
import getConfig from "next/config";

import { getHashFromBoard } from "../chess";
import { Board, Node, Side } from "../types";
import { getNetworkNodeFromDataNode } from "./NetworkNode";

const STORAGE_ROOT = path.join(
  getConfig().serverRuntimeConfig.PROJECT_ROOT,
  "static"
);

const getIsFileExist = async (path: string) => {
  try {
    await promises.access(path);
    return true;
  } catch {
    return false;
  }
};

const getFilename = (levelZeroSide: Side, levelZeroBoard: Board) => {
  const boardHash = getHashFromBoard(levelZeroBoard);
  return `${levelZeroSide}-${boardHash}.json`;
};

export const storeOpenSet = async (
  levelZeroSide: Side,
  levelZeroBoard: Board,
  nodes: Array<Node>
) => {
  const filename = getFilename(levelZeroSide, levelZeroBoard);
  const content = JSON.stringify(
    nodes.map((node) => getNetworkNodeFromDataNode(node))
  );
  const fullpath = path.join(STORAGE_ROOT, filename);

  await promises.mkdir(STORAGE_ROOT, { recursive: true });
  if (await getIsFileExist(fullpath)) {
    await promises.rm(fullpath);
  }
  await promises.writeFile(fullpath, content);
};
