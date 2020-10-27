import gql from "graphql-tag";
import {
  BATCH_QUERIES
} from "../../constants";

export const ALL_BITES_QUERY = gql`
  query allBites($collateral: String!, $offset: Int) {
    allBites(ilkIdentifier: $collateral, first: ${BATCH_QUERIES}, offset: $offset) {
      nodes {
        bidId
        tx {
          txFrom
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const ALL_FLIP_BIDS_QUERY = gql`
  query allFlipBidEvents($offset: Int) {
    allFlipBidEvents(first: ${BATCH_QUERIES}, offset: $offset) {
      nodes {
        bidId
        act
        tx {
          nodes {
            txFrom
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const ALL_FLIP_WINS_QUERY = gql`
  query allFlipBidGuys($flipper: String!, $offset: Int) {
    allFlipBidGuys(
      filter: {
        addressByAddressId: { address: { equalToInsensitive: $flipper } }
      }
      orderBy: HEADER_BY_HEADER_ID__BLOCK_NUMBER_DESC
      first: ${BATCH_QUERIES}
      offset: $offset
    ) {
      nodes {
        bidId
        guy
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// USER QUERIES

// FLIP BIDS FOR USER
export const USER_FLIPS_BIDS_QUERY = gql`
  query userFlipBids($flipper: String!, $address: String) {
    allFlipBidGuys(
      filter: {
        addressByAddressId: { address: { equalToInsensitive: $flipper } }
        guy: { equalToInsensitive: $address }
      }
      orderBy: HEADER_BY_HEADER_ID__BLOCK_NUMBER_DESC
      first: ${BATCH_QUERIES}
      offset: 0
    ) {
      nodes {
        bidId
        guy
      }
    }
  }
`;

// FLIP WINS FOR USER
