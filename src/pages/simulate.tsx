import type { GetServerSidePropsContext, NextPage } from "next";
import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

import { getBoardFromHash } from "../chess";
import Simulator from "../containers/Simulator";

const Simulate: NextPage = ({ board, side, exportTimes, increment }: any) => {
  return (
    <Simulator
      board={board}
      exportTimes={exportTimes}
      toBeMovedBy={side}
      increment={increment}
    />
  );
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side, increment, exportTimes } = query;

  const fShortHash = shortHash ?? getHashFromBoard(getInitialBoard());
  const destination = `/simulate?side=${
    side ?? Side.Bottom
  }&shortHash=${fShortHash}`;

  if (!shortHash || !side) {
    return {
      redirect: { destination },
    };
  }

  const board = getBoardFromHash(query.shortHash as string);
  return {
    props: {
      board,
      side,
      increment: increment ?? 1,
      exportTimes: exportTimes ?? 5000,
    },
  };
};

export default Simulate;
