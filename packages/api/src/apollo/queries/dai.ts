import gql from "graphql-tag";

export const ALL_POT_JOINS_QUERY = gql`
  query allPotJoins($offset: Int) {
    allPotJoins(first: 1000, offset: $offset) {
      nodes {
        id
        wad
        eventLogByLogId {
          transactionByTxHash {
            txFrom
          }
          blockNumber
          txHash
        }
      }
    }
  }
`;

export const ALL_POT_EXITS_QUERY = gql`
  query allPotExits($offset: Int) {
    allPotExits(first: 1000, offset: $offset) {
      totalCount
      nodes {
        wad
        eventLogByLogId {
          transactionByTxHash {
            txFrom
          }
        }
      }
    }
  }
`;

// TRANSFERRED_DAI_QUERY
export const USER_DAI_TRANSFERS_QUERY = gql`
  query userDaiTransfers($address: String) {
    transfers(where: {src: $address}) {
      wad
    }
  }
`;

export const USER_POT_JOINS_QUERY = gql`
  query userPotJoins($address: String) {
    joins(where: {address: $address}) {
      address
      wad
      timestamp
    }
  }
`;

export const USER_POT_EXITS_QUERY = gql`
  query userPotExits($address: String) {
    exits(where: {address: $address}) {
      address
      wad
      timestamp
    }
  }
`;
