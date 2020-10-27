import gql from "graphql-tag";
import { SUBGRAPH_BATCHES } from "../../constants";

// ADMIN QUERIES

export const ALL_POLL_VOTES_QUERY = gql`
  query votePollActions($skip: Int) {
    votePollActions(first: ${SUBGRAPH_BATCHES}, skip: $skip) {
      id
      sender
      poll {
        pollId
      }
      timestamp
    }
  }
`;

export const ALL_SPELL_VOTES_QUERY = gql`
  query spellVoteActions($skip: Int) {
    addActions(first: ${SUBGRAPH_BATCHES}, skip: $skip) {
      sender
      spell {
        id
      }
    }
  }
`;

export const ALL_EARLY_POLL_VOTES_QUERY = gql`
  query votePollActions($skip: Int) {
    votePollActions(first: ${SUBGRAPH_BATCHES}, skip: $skip) {
      sender
      poll {
        startDate
      }
      timestamp
    }
  }
`;

export const ALL_EARLY_SPELL_VOTES_QUERY = gql`
  query spellVoteActions($skip: Int) {
    addActions(first: ${SUBGRAPH_BATCHES}, skip: $skip) {
      sender
      spell {
        id
        timestamp
      }
      timestamp
    }
  }
`;

// USER QUERIES

export const PROXY_HOT_LOOKUP_QUERY = gql`
  query hotProxyLookup($address: String) {
    voterRegistries(where: {hotAddress: $address}) {
      id
      coldAddress
      hotAddress
      voteProxies {
        id
      }
    }
  }
`;

export const PROXY_COLD_LOOKUP_QUERY = gql`
  query coldProxyLookup($address: String) {
    voterRegistries(where: {coldAddress: $address}) {
      id
      coldAddress
      hotAddress
      voteProxies {
        id
      }
    }
  }
`;

export const USER_POLL_VOTES_QUERY = gql`
  query votePollActions($address: String) {
    votePollActions(where: { sender: $address }) {
      id
      sender
      poll {
        pollId
      }
      timestamp
    }
  }
`;

export const EARLY_POLL_VOTES_QUERY = gql`
  query votePollActions($address: String) {
    votePollActions(where: {sender: $address}) {
      id
      sender
      poll {
        pollId
        startDate
      }
      timestamp
    }
  }
`;

// CONSECUTIVE_POLL_VOTE_QUERY
export const USER_CONSECUTIVE_POLL_VOTE_QUERY = gql`
  query consecutivePolls($address: String) {
    votePollActions(where: {sender: $address}) {
      id
      sender
      poll {
        pollId
      }
    }
  }
`;

// EARLY_SPELL_VOTER_QUERY
export const EARLY_SPELL_VOTES_QUERY = gql`
  query earlySpellVotes($address: String) {
    addActions(where: {sender: $address}) {
      id
      sender
      timestamp
      spell {
        id
        timestamp
      }
    }
  }
`;
