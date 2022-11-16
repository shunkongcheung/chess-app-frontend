import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";
import { getOpenSetNetworkNodes } from "../utils/Storage";

import Checker from "../containers/Checker";
import { INITIAL_HASH, PSEUDO_HIGH_PRIORITY } from "../constants";

const Check: NextPage = ({
  levelZeroNode,
  highestPriority,
  maximumLevel,
  runTimes,
  currentNode,
  maxReachedLevel,
}: any) => {
  return (
    <Checker
      highestPriority={highestPriority}
      currentNode={currentNode}
      levelZeroNode={levelZeroNode}
      maximumLevel={maximumLevel}
      maxReachedLevel={maxReachedLevel}
      runTimes={runTimes}
    />
  );
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { shortHash, side, index } = query;

  const fShortHash = shortHash ?? INITIAL_HASH;
  const fSide = side ?? Side.Bottom;
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

  const { networkNodes, runTimes, maximumLevel } = await getOpenSetNetworkNodes(
    side as Side,
    shortHash as string
  );

  const maxReachedLevel = networkNodes.reduce(
    (prev, curr) => Math.max(prev, curr.level),
    0
  );

  const highestPriority = networkNodes.reduce(
    (prev, curr) =>
      curr.priority === PSEUDO_HIGH_PRIORITY
        ? prev
        : Math.max(prev, curr.priority),
    -PSEUDO_HIGH_PRIORITY
  );

  const currentNetworkNode = networkNodes.find((item) => item.index === fIndex);
  if (!currentNetworkNode) {
    throw Error(`/check: Cannot find index ${fIndex}`);
  }

  const currentNode = {
    ...currentNetworkNode,
    parent:
      networkNodes.find((item) => item.index === currentNetworkNode.parent) ??
      null,
    children: networkNodes.filter((item) =>
      currentNetworkNode.children.includes(item.index)
    ),
  };

  const levelZeroNode = networkNodes.find((item) => item.index === 0);

  return {
    props: {
      currentNode,
      maxReachedLevel,
      runTimes,
      maximumLevel,
      levelZeroNode,
      highestPriority,
    },
  };
};

export default Check;
