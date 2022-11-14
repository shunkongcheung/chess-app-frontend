import { Side } from "../types";

interface Args {
  level: number;
  score: number;
  levelZeroSide: Side;
  levelZeroScore: number;
}

const getPriorityScore = ({
  level,
  score,
  levelZeroSide,
  levelZeroScore,
}: Args) => {
  // Example 1:
  // levelZeroSide = Top
  // levelOneSide = Bottom
  // on level one, highest value equals good score (i.e. to the front)
  //
  // Example 2:
  // levelZeroSide = Bottom
  // levelOneSide = Top
  // on level one, lowest value equal good score (i.e. to the front)

  const levelOneSide = levelZeroSide === Side.Top ? Side.Bottom : Side.Top;
  const nodeSide = level % 2 === 0 ? levelZeroSide : levelOneSide;
  return nodeSide === Side.Top
    ? levelZeroScore - score
    : score - levelZeroScore;
};

export default getPriorityScore;
