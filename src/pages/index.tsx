import type { NextPage } from "next";

const Index: NextPage = () => {
  return <></>;
};

export const getServerSideProps = () => {
  return {
    redirect: { destination: "/simulate" },
  };
};

export default Index;
