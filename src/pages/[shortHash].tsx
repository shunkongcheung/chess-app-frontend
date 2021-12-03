import type { NextPage } from 'next';

import ChessBoardDetail from '../containers/ChessBoardDetail';
import {fetchChessBoard} from '../utils';


const Home: NextPage = ({ chessBoard }: any) => {
  return (<ChessBoardDetail chessBoard={chessBoard}/>)
}

export const getServerSideProps = async ({query}) => {
  const chessBoard = await fetchChessBoard(query.shortHash)
  return {
    props: {
      chessBoard
    }
  }
}

export default Home

