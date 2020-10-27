import * as R from 'ramda';
import * as _ from 'lodash';

import { governanceClient } from "../apollo/clients";
import {
  ALL_POLL_VOTES_QUERY,
  // USER_CONSECUTIVE_POLL_VOTE_QUERY,
  ALL_EARLY_POLL_VOTES_QUERY,
  ALL_SPELL_VOTES_QUERY,
  ALL_EARLY_SPELL_VOTES_QUERY
} from "../apollo/queries/governance";
import {
  mapFrequenciesToProgressObject,
  longestConsecutiveCount,
  addressListFilteredByFrequency
} from "../utils";
import {
  SUBGRAPH_BATCHES
} from "../constants";

// GOVERNANCE POLLS

export async function allGovernancePollAddresses() {
  let wholeResult = [];
  let b = true;
  let i = 0;
  while (b === true) {
    i = i + 1;
    const result = await governanceClient.query({
      query: ALL_POLL_VOTES_QUERY,
      fetchPolicy: "cache-first",
      variables: {
        skip: i * SUBGRAPH_BATCHES,
      },
    });
    if (result.data.votePollActions.length > 0) {
      wholeResult.push.apply(wholeResult, result.data.votePollActions);
    } else {
      b = false;
    }
  }

  return wholeResult.map((action: any) => {
    return action.sender;
  });
}

export async function allGovernancePollAddressesWithPollId() {
  let wholeResult = [];
  let b = true;
  let i = 0;
  while (b === true) {
    i = i + 1;
    const result: any = await governanceClient.query({
      query: ALL_POLL_VOTES_QUERY,
      fetchPolicy: "cache-first",
      variables: {
        skip: i * SUBGRAPH_BATCHES,
      },
    }).catch(err => console.log(err));
    if (result.data.votePollActions.length > 0) {
      wholeResult.push.apply(wholeResult, result.data.votePollActions);
    } else {
      b = false;
    }
  }

  return wholeResult.map((action: any) => {
    return { sender: action.sender, pollId: action.poll.pollId };
  });
}

export async function allGovernancePollAddressesWithTimestamps() {
  let wholeResult = [];
  let b = true;
  let i = 0;
  while (b === true) {
    i = i + 1;
    const result: any = await governanceClient.query({
      query: ALL_EARLY_POLL_VOTES_QUERY,
      fetchPolicy: "cache-first",
      variables: {
        skip: i * SUBGRAPH_BATCHES,
      },
    }).catch(err => console.log(err));
    if (result.data.votePollActions.length > 0) {
      wholeResult.push.apply(wholeResult, result.data.votePollActions);
    } else {
      b = false;
    }
  }

  return wholeResult.map((action: any) => {
    return {
      sender: action.sender,
      createdTimestamp: action.poll.startDate,
      votedTimestamp: action.timestamp
    };
  });
}

export function pollVoteAddressesForFrequency(
  frequency: number,
  addressList: string[]
): { addresses: any[]; progress: Object } {
  const pollVoteFreq = addressListFilteredByFrequency(addressList);

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(pollVoteFreq, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')

  const _progress = mapFrequenciesToProgressObject(pollVoteFreq, frequency)

  return {
    addresses: _addresses,
    progress: _progress,
  };
}

const addressListFilteredForConsecutive = (list: { sender: string, pollId: string }[]) => {
  return _.map(_.uniq(list), ((x) => {
    return {
      address: x.sender,
      frequency: longestConsecutiveCount(
        list.filter(_poll => {
          // get pollIds for current address
          if (_poll.sender === x.sender) {
            return _poll.pollId
          }
          return null;
        }).map(function (el) {
          // return an array of pollIds for each address
          return parseInt(el.pollId)
        })
      )
    }
  }));
}

export function consecutivePollVoteAddressesForFrequency(
  frequency: number,
  addressList: { sender: string, pollId: string }[]
): { addresses: any[]; progress: Object } {
  const consecutivePollVoteFreq = addressListFilteredForConsecutive(addressList)

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(consecutivePollVoteFreq, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')


  const _progress = mapFrequenciesToProgressObject(consecutivePollVoteFreq, frequency)

  return {
    addresses: _addresses,
    progress: _progress,
  }
}

const addressListFilteredByTime = (list: any[], time: number): any[] => {
  return _.map(_.uniq(list), ((x) => {
    return {
      address: x.sender,
      frequency: _.size(_.filter(list, (poll) => {
        // get pollIds for current address
        return x.sender === poll.sender && (poll.votedTimestamp - poll.createdTimestamp) < time
      }))
    }
  }));
};

export function earlyPollVoteAddressesForTime(
  time: number,
  addressList: { sender: string, votedTimestamp: number, createdTimestamp: number }[]
): { addresses: string[], progress: {} } {

  const earlyPollVoteFreq = addressListFilteredByTime(addressList, time)

  const filterByFreqGtZero = (obj: { address: string, frequency: number }) => {
    if (R.gt(obj.frequency, 0)) { return obj.address; }
    return;
  };

  const _addresses = _.compact(_.map(earlyPollVoteFreq, filterByFreqGtZero));

  return {
    addresses: _addresses,
    progress: {}
  }
}

// EXECUTIVE PROPOSALS (SPELLS)

export async function allExecutiveSpellAddresses() {
  let wholeResult = [];
  let b = true;
  let i = 0;
  while (b === true) {
    i = i + 1;
    const result = await governanceClient.query({
      query: ALL_SPELL_VOTES_QUERY,
      fetchPolicy: "cache-first",
      variables: {
        skip: i * 1000,
      },
    });
    if (result.data.addActions.length > 0) {
      wholeResult.push.apply(wholeResult, result.data.addActions);
    } else {
      b = false;
    }
  }

  return wholeResult.map((action: any) => {
    return action.sender;
  });
}

export async function allExecutiveSpellAddressesWithTimestamps() {
  let wholeResult = [];
  let b = true;
  let i = 0;
  while (b === true) {
    i = i + 1;
    const result = await governanceClient.query({
      query: ALL_EARLY_SPELL_VOTES_QUERY,
      fetchPolicy: "cache-first",
      variables: {
        skip: i * 1000,
      },
    });
    if (result.data.addActions.length > 0) {
      wholeResult.push.apply(wholeResult, result.data.addActions);
    } else {
      b = false;
    }
  }

  return wholeResult.map((action: any) => {
    return {
      sender: action.sender,
      createdTimestamp: action.spell.timestamp,
      votedTimestamp: action.timestamp
    };
  });
}

export function spellVoteAddressesForFrequency(
  frequency: number,
  addressList: string[]
): { addresses: string[]; progress: Object } {
  const spellVoteFreq = addressListFilteredByFrequency(addressList);

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(spellVoteFreq, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')

  const _progress = mapFrequenciesToProgressObject(spellVoteFreq, frequency)

  return {
    addresses: _addresses,
    progress: _progress,
  };
}

export function earlyExecutiveVoteAddressesForTime(
  time: number,
  addressList: { sender: string, votedTimestamp: number, createdTimestamp: number }[]
) {
  const earlySpellVoteFreq = addressListFilteredByTime(addressList, time)

  const mapping = _.map(earlySpellVoteFreq, (obj) => { if (R.gt(obj.frequency, 0)) { return obj; } });

  const _addresses = _.compact(_.map(mapping, 'address'))

  const _progress = {} // need to deal with time in --> mapFrequenciesToProgressObject(time, filterEarlySpellVoteFreq)

  return {
    addresses: _addresses,
    progress: _progress
  }
}
