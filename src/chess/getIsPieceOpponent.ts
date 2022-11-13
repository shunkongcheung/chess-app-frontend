import getIsPieceEmpty from "./getIsPieceEmpty";

const isUpper = (char: string) => {
  return char == char.toUpperCase() && char != char.toLowerCase();
};

const getIsPieceOpponent = (curPiece: string, nextPiece: string) => {
  if (getIsPieceEmpty(nextPiece)) return false;
  return isUpper(curPiece) !== isUpper(nextPiece);
};
export default getIsPieceOpponent;
