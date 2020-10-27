import fetch from "cross-fetch";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";

const MAKER_URL: string = process.env.MAKER_URL!;
const MAKER_USER: string = process.env.MAKER_USER!;
const MAKER_PW: string = process.env.MAKER_PW!;

export const governanceClient = new ApolloClient({
  link: new HttpLink({
    uri:
      "https://api.thegraph.com/subgraphs/name/scottrepreneur/maker-governance",
    fetch,
  }),
  cache: new InMemoryCache(),
});

export const makerVaultsClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/graphitetools/maker",
    fetch,
  }),
  cache: new InMemoryCache(),
});

export const daiClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/raid-guild/dai-subgraph",
    fetch,
  }),
  cache: new InMemoryCache(),
});

const authLink = setContext((_, { headers }) => {
  const token = Buffer.from(`${MAKER_USER}:${MAKER_PW}`).toString("base64");
  return {
    headers: {
      ...headers,
      Authorization: `Basic ${token}`,
    },
  };
});

export const makerClient = new ApolloClient({
  link: authLink.concat(
    new HttpLink({
      uri: MAKER_URL,
      fetch,
    }),
  ),
  cache: new InMemoryCache(),
});
