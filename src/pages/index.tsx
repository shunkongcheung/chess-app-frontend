import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

export default function Index() {
  return <></>;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: `/${Side.Bottom}/${getHashFromBoard(getInitialBoard())}`,
      permanent: true,
    },
  };
}
