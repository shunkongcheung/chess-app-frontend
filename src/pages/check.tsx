import type { GetServerSidePropsContext, NextPage } from "next";
import { Side } from "../types";
import { getOpenSetNetworkNodes } from "../utils/Storage";

import Checker from "../containers/Checker";
import { INITIAL_HASH, PSEUDO_HIGH_PRIORITY } from "../constants";
import { getLogFormatter } from "../utils/Logger";

const logFormatter = getLogFormatter("/check");

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

  const { networkNodes, runTimes } = await getOpenSetNetworkNodes(
    side as Side,
    shortHash as string
  );

  const maxReachedNode = networkNodes.reduce(
    (prev, curr) => (prev.level > curr.level ? prev : curr),
    networkNodes[0]
  );
  const total = networkNodes.length;

  const highestPriorityNode = networkNodes.reduce((prev, curr) => {
    if (curr.priority === PSEUDO_HIGH_PRIORITY) return prev;
    if (curr.priority > prev.priority) {
      return curr;
    }
    return prev;
  }, networkNodes[networkNodes.length - 1]);

  const currentNetworkNode = networkNodes.find((item) => item.index === fIndex);
  if (!currentNetworkNode) {
    throw Error(logFormatter(`Cannot find index ${fIndex}`));
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
      maxReachedNode,
      runTimes,
      levelZeroNode,
      highestPriorityNode,
      total,
    },
  };
};

export default Check;
