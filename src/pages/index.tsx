import { getInitialBoard, getHashFromBoard } from "../chess";
import { Side } from "../types";

export default () => {
  return <></>;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination:  `/${Side.Bottom}/${getHashFromBoard(getInitialBoard())}`,
      permanent: true,
    },
  }
}
