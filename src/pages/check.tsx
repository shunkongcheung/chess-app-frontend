import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";

import { getSequelize } from "../database/getSequelize";
import { getCheckInfo } from "../database/getCheckInfo";

import Checker from "../containers/Checker";
import { INITIAL_HASH } from "../constants";

const Check: NextPage = ({
  levelZeroNode,
  highestPriorityNode,
  runTimes,
  currentNode,
  maxReachedNode,
  total,
}: any) => {
  return (
    <Checker
      highestPriorityNode={highestPriorityNode}
      currentNode={currentNode}
      levelZeroNode={levelZeroNode}
      maxReachedNode={maxReachedNode}
      runTimes={runTimes}
      total={total}
    />
  );
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { shortHash, side, index } = query;

  const fShortHash = (shortHash as string) ?? INITIAL_HASH;
  const fSide = (side as Side) ?? Side.Bottom;
  const fIndex = Number(index ?? 0);

  let destination = `/check?`;
  destination += `side=${fSide}&`;
  destination += `shortHash=${fShortHash}&`;
  destination += `index=${fIndex}&`;

  if (!shortHash || !side || !index) {
    return {
      redirect: { destination },
    };
  }

  const sequelize = await getSequelize();
  try {
    const {
      currentNode,
      levelZeroNode,
      maxReachedNode,
      runTimes,
      highestPriorityNode,
      total,
    } = await getCheckInfo(fSide, fShortHash, fIndex);
    await sequelize.close();

    return {
      props: {
        currentNode,
        maxReachedNode,
        runTimes,
        levelZeroNode,
        highestPriorityNode,
        total,
      },
    };
  } catch (err) {
    await sequelize.close();
    throw err;
  }
};

export default Check;
