import { Board, Piece } from "../types";

const getInitialBoard = (): Board => {
  const [CNU, CNL] = [Piece.CANNON.toUpperCase(), Piece.CANNON.toLowerCase()];
  const [CEU, CEL] = [Piece.CASTLE.toUpperCase(), Piece.CASTLE.toLowerCase()];
  const [GLU, GLL] = [Piece.GENERAL.toUpperCase(), Piece.GENERAL.toLowerCase()];
  const [HEU, HEL] = [Piece.HORSE.toUpperCase(), Piece.HORSE.toLowerCase()];
  const [JOU, JOL] = [Piece.JUMBO.toUpperCase(), Piece.JUMBO.toLowerCase()];
  const [KTU, KTL] = [Piece.KNIGHT.toUpperCase(), Piece.KNIGHT.toLowerCase()];
  const [SRU, SRL] = [Piece.SOLDIER.toUpperCase(), Piece.SOLDIER.toLowerCase()];
  const EMY = Piece.EMPTY;

  return [
    [CEU, HEU, JOU, KTU, GLU, KTU, JOU, HEU, CEU],
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY],
    [EMY, CNU, EMY, EMY, EMY, EMY, EMY, CNU, EMY],
    [SRU, EMY, SRU, EMY, SRU, EMY, SRU, EMY, SRU],
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY],

    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY],
    [SRL, EMY, SRL, EMY, SRL, EMY, SRL, EMY, SRL],
    [EMY, CNL, EMY, EMY, EMY, EMY, EMY, CNL, EMY],
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY],
    [CEL, HEL, JOL, KTL, GLL, KTL, JOL, HEL, CEL],
  ];
};

export default getInitialBoard;
