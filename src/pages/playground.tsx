import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";

import Playground from "../containers/Playground";
import { DEFAULT_RUN_TIMES, INITIAL_HASH } from "../constants";
import { getAllNextPositions, getBoardFromHash, getMovedBoard } from "../chess";

const Page: NextPage = ({ side, runTimes, board, nextBoards }: any) => {
  return (
    <Playground
      side={side}
      runTimes={runTimes}
      board={board}
      nextBoards={nextBoards}
    />
  );
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { shortHash, side, runTimes } = query;

  const fSide = (side as Side) ?? Side.Bottom;
  const fRunTimes = Number(runTimes ?? DEFAULT_RUN_TIMES);
  const fShortHash = (shortHash as string) ?? INITIAL_HASH;

  let destination = `/playground?`;
  destination += `side=${fSide}&`;
  destination += `runTimes=${fRunTimes}&`;
  destination += `shortHash=${fShortHash}&`;

  if (!shortHash || !side || !runTimes) {
    return {
      redirect: { destination },
    };
  }

  const board = getBoardFromHash(fShortHash);
  const isUpperSide = fSide === Side.Top;
  const nextBoards = getAllNextPositions(board, isUpperSide).map((move) =>
    getMovedBoard(board, move.from, move.to)
  );

  return {
    props: {
      side: fSide,
      runTimes: fRunTimes,
      board,
      nextBoards,
    },
  };
};

export default Page;
