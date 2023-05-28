import { Piece, Side } from "../types";
import { ChessBoard, ChessNode } from "./types";

const helper = (row: number) => (data: { piece: Piece, side: Side }, col: number): ChessNode => ({ ...data, position: [row, col] });

const getInitialBoard = (): ChessBoard => {
  const [CNU, CNL] = [{ piece: Piece.CANNON, side: Side.Top },{ piece: Piece.CANNON, side: Side.Bottom }];
  const [CEU, CEL] = [{ piece: Piece.CASTLE, side: Side.Top }, { piece:Piece.CASTLE, side: Side.Bottom }];
  const [GLU, GLL] = [{ piece: Piece.GENERAL, side: Side.Top }, { piece:Piece.GENERAL, side: Side.Bottom }];
  const [HEU, HEL] = [{ piece: Piece.HORSE, side: Side.Top }, { piece:Piece.HORSE, side: Side.Bottom }];
  const [JOU, JOL] = [{ piece: Piece.JUMBO, side: Side.Top }, { piece:Piece.JUMBO, side: Side.Bottom }];
  const [KTU, KTL] = [{ piece: Piece.KNIGHT, side: Side.Top }, { piece:Piece.KNIGHT, side: Side.Bottom }];
  const [SRU, SRL] = [{ piece: Piece.SOLDIER, side: Side.Top }, { piece:Piece.SOLDIER, side: Side.Bottom }];
  const EMY = { piece: Piece.EMPTY, side: Side.None };

  return [
    [CEU, HEU, JOU, KTU, GLU, KTU, JOU, HEU, CEU].map(helper(0)),
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY].map(helper(1)),
    [EMY, CNU, EMY, EMY, EMY, EMY, EMY, CNU, EMY].map(helper(2)),
    [SRU, EMY, SRU, EMY, SRU, EMY, SRU, EMY, SRU].map(helper(3)),
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY].map(helper(4)),

    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY].map(helper(5)),
    [SRL, EMY, SRL, EMY, SRL, EMY, SRL, EMY, SRL].map(helper(6)),
    [EMY, CNL, EMY, EMY, EMY, EMY, EMY, CNL, EMY].map(helper(7)),
    [EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY, EMY].map(helper(8)),
    [CEL, HEL, JOL, KTL, GLL, KTL, JOL, HEL, CEL].map(helper(9)),
  ];
};

export default getInitialBoard;
