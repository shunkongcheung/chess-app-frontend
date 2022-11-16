import type { GetServerSidePropsContext, NextPage } from "next";
import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

import { getBoardFromHash } from "../chess";
import Playground from "../containers/Playground";

const Page: NextPage = ({ board, side, runTimes }: any) => {
  return (
    <Playground
      board={board}
      runTimes={runTimes}
      side={side}
    />
  );
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side, runTimes } = query;

  const fRunTimes = runTimes ?? 5000;
  const fSide = side ?? Side.Bottom
  const fShortHash = shortHash ?? getHashFromBoard(getInitialBoard());
  const destination = `/playground?side=${fSide}&shortHash=${fShortHash}&runTimes=${fRunTimes}`;

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
