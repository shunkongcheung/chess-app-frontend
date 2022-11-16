import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";

import { getBoardFromHash } from "../chess";
import Simulator from "../containers/Simulator";
import {
  DEFAULT_INCREMENT,
  INITIAL_HASH,
  DEFAULT_RUN_TIMES,
  DEFAULT_MAXIMUM_LEVEL,
} from "../constants";

const Simulate: NextPage = ({
  board,
  side,
  exportTimes,
  increment,
  maximumLevel,
}: any) => {
  return (
    <Simulator
      board={board}
      exportTimes={exportTimes}
      toBeMovedBy={side}
      increment={increment}
      maximumLevel={maximumLevel}
    />
  );
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side, increment, exportTimes, maximumLevel } = query;

  const fShortHash = shortHash ?? INITIAL_HASH;
  const fSide = side ?? Side.Bottom;
  const fIncrement = Number(increment ?? DEFAULT_INCREMENT);
  const fExportTimes = Number(exportTimes ?? DEFAULT_RUN_TIMES);
  const fMaxmiumLevel = Number(maximumLevel ?? DEFAULT_MAXIMUM_LEVEL);

  let destination = `/simulate?`;
  destination += `side=${fSide}&`;
  destination += `shortHash=${fShortHash}&`;
  destination += `increment=${fIncrement}&`;
  destination += `exportTimes=${fExportTimes}&`;
  destination += `maximumLevel=${fMaxmiumLevel}&`;

  if (!shortHash || !side || !increment || !exportTimes || !maximumLevel) {
    return {
      redirect: { destination },
    };
  }

  const board = getBoardFromHash(fShortHash as string);
  return {
    props: {
      board,
      side,
      increment: fIncrement,
      exportTimes: fExportTimes,
      maximumLevel: fMaxmiumLevel,
    },
  };
};

export default Simulate;
