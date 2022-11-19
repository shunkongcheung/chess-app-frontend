import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";

import Simulator from "../containers/Simulator";
import {
  DEFAULT_INCREMENT,
  INITIAL_HASH,
  DEFAULT_RUN_TIMES,
} from "../constants";

const Simulate: NextPage = ({
  boardHash,
  side,
  exportTimes,
  increment,
}: any) => {
  return (
    <Simulator
      boardHash={boardHash}
      exportTimes={exportTimes}
      toBeMovedBy={side}
      increment={increment}
    />
  );
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side, increment, exportTimes } = query;

  const fShortHash = shortHash ?? INITIAL_HASH;
  const fSide = side ?? Side.Bottom;
  const fIncrement = Number(increment ?? DEFAULT_INCREMENT);
  const fExportTimes = Number(exportTimes ?? DEFAULT_RUN_TIMES);

  let destination = `/simulate?`;
  destination += `side=${fSide}&`;
  destination += `exportTimes=${fExportTimes}&`;
  destination += `increment=${fIncrement}&`;
  destination += `shortHash=${fShortHash}&`;

  if (!shortHash || !side || !increment || !exportTimes) {
    return {
      redirect: { destination },
    };
  }

  return {
    props: {
      boardHash: fShortHash,
      side,
      increment: fIncrement,
      exportTimes: fExportTimes,
    },
  };
};

export default Simulate;
