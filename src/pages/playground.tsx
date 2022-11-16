import type { GetServerSidePropsContext, NextPage } from "next";
import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

import { getBoardFromHash } from "../chess";
import Playground from "../containers/Playground";
import { DEFAULT_RUN_TIMES, INITIAL_HASH } from "../constants";

const Page: NextPage = ({ board, side, runTimes }: any) => {
  return <Playground board={board} runTimes={runTimes} side={side} />;
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side, runTimes } = query;

  const fRunTimes = runTimes ?? DEFAULT_RUN_TIMES;
  const fSide = side ?? Side.Bottom;
  const fShortHash = shortHash ?? INITIAL_HASH;

  let destination = `/playground?`;
  destination += `side=${fSide}&`;
  destination += `shortHash=${fShortHash}&`;
  destination += `runTimes=${fRunTimes}`;

  if (!shortHash || !side || !runTimes) {
    return {
      redirect: { destination },
    };
  }

  const board = getBoardFromHash(query.shortHash as string);
  return {
    props: { board, side, runTimes },
  };
};

export default Page;
