import type { GetServerSidePropsContext, NextPage } from "next";

import { getBoardFromHash } from "../../chess";
import ChessBoardDetail from "../../containers/ChessBoardDetail";

const Home: NextPage = ({ board, side }: any) => {
  return <ChessBoardDetail board={board} toBeMovedBy={side} />;
};

export const getServerSideProps = ({
  query,
}: GetServerSidePropsContext) => {
  const board = getBoardFromHash(query.shortHash as string);
  const side = query.side; 

  return {
    props: {
      board,
      side,
    }
  }
};

export default Home;
