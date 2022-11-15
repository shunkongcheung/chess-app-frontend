import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";
import { getFileOpenSet } from "../utils/Storage";

import Checker from "../containers/Checker";

const Check: NextPage = ({ node }: any) => {
  return <Checker node={node} />;
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { shortHash, side, index } = query;

  console.log("hello", { shortHash, side });

  if (!shortHash || !side) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  const node = await getFileOpenSet(
    side as Side,
    shortHash as string,
    Number(index ?? 0)
  );

  return {
    props: { node },
  };
};

export default Check;
