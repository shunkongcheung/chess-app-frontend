import type { GetServerSidePropsContext, NextPage } from "next";
import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

import { getBoardFromHash } from "../chess";
import Simulator from "../containers/Simulator";

const Index: NextPage = ({ board, side }: any) => {
  return <Simulator board={board} toBeMovedBy={side} />;
};

export const getServerSideProps = ({ query }: GetServerSidePropsContext) => {
  const { shortHash, side } = query;

  if (!shortHash || !side) {
    return {
      redirect: {
        destination: `/?side=${side ?? Side.Bottom}&shortHash=${
          shortHash ?? getHashFromBoard(getInitialBoard())
        }`,
        permanent: true,
      },
    };
  }

  const board = getBoardFromHash(query.shortHash as string);
  return {
    props: { board, side },
  };
};

export default Index;
