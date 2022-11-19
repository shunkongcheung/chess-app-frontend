import { Position } from "./types";

interface Args {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

const getIsPositionInBound = (position: Position, args?: Args) => {
  const { left = 0, top = 0, width = 9, height = 10 } = args || {};

  if (position[1] < left || position[1] >= left + width) return false;
  if (position[0] < top || position[0] >= top + height) return false;

  return true;
};

export default getIsPositionInBound;
