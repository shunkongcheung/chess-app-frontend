import { ApolloClient, InMemoryCache } from "@apollo/client";

const getApolloClient = () => {
  const client = new ApolloClient({
    uri: "http://localhost:3004/graphql",
    cache: new InMemoryCache(),
  });
  return client;
};

export default getApolloClient;
