import type { GetServerSidePropsContext, NextPage } from 'next';

import ChessBoardDetail from '../containers/ChessBoardDetail';
import {fetchChessBoard} from '../utils';


const Home: NextPage = ({ chessBoard }: any) => {
  return (<ChessBoardDetail chessBoard={chessBoard}/>)
}

export const getServerSideProps = async ({query}: GetServerSidePropsContext) => {
  const chessBoard = await fetchChessBoard(query.shortHash as string)
  return {
    props: {
      chessBoard
    }
  }
}

export default Home

