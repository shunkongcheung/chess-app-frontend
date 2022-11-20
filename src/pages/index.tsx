import type { NextPage } from "next";

const Index: NextPage = () => {
  return <></>;
};

export const getServerSideProps = () => {
  return {
    redirect: { destination: "/playground" },
  };
};

export default Index;
