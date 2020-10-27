import * as _ from 'lodash';

import { governanceClient } from '../apollo/clients'
import { PROXY_HOT_LOOKUP_QUERY, PROXY_COLD_LOOKUP_QUERY } from "../apollo/queries/governance";

export function mapFrequenciesToProgressObject(
  freqMap: { address: string, frequency: number }[],
  frequency: number
): {} {
  let progressObject = {};

  _.each(freqMap, function (obj) {
    progressObject[obj.address] = obj.frequency / frequency > 1 ? 1 : obj.frequency / frequency;
  });

  return progressObject;
}

export const addressListFilteredByFrequency = (list: string[]): any[] => {
  return _.map(_.uniq(list), ((x) => {
    return {
      address: x,
      frequency: list.filter(y => y === x).length
    }
  }));
};


export async function checkTemplateAddressesForAddressList(
  addressList: string[],
  addresses: string[],
) {

  const match: any[] = addressList.map(address => {
    if (!address) {
      return 0;
    }
    if (addresses.includes(address.toLowerCase()) === true) {
      return address.toLowerCase();
    } else {
      return null;
    }
  })
  var filtered = match.filter(function (el) {
    return el != null;
  });
  var noDupes = [... new Set(filtered)]

  if (noDupes.length > 0) {
    // console.log('unlocked')
    return noDupes[0];
  }
  return '0x';
}

export async function checkTemplateProgressForAddressList(
  addressList: string[],
  progress: {},
) {
  const match: number[] = addressList.map(address => {
    if (progress[address.toLowerCase()]) {
      return progress[address.toLowerCase()];
    }
    return 0;
  })
  return Math.max(...match);
}

const getProxyAddress = async (query, address) => {
  const result: any = await governanceClient.query({
    query: query,
    variables: {
      address: address
    },
    fetchPolicy: "cache-first",
  }).catch(err => console.log(err));

  // deal with multiple voterRegisty entries
  // deal with multiple proxies

  if (result.data.voterRegistries[0]) {
    return result.data.voterRegistries[0]['voteProxies'][0]['id'];
  } else {
    return address;
  }
}

export async function checkForProxyAddresses(address: string): Promise<any[]> {
  const lookup_types = [
    PROXY_HOT_LOOKUP_QUERY,
    PROXY_COLD_LOOKUP_QUERY
  ]
  // let addresses = [address]

  return Promise.all(lookup_types.map(query => getProxyAddress(query, address)))
}

export function longestConsecutiveCount(arr: number[]) {
  let chunks: any[] = [];
  let prev: number = 0;

  var sorted = arr.sort(function (a, b) { return a - b });

  sorted.forEach((current) => {
    if (current - prev != 1) chunks.push([]);
    chunks[chunks.length - 1].push(current);
    prev = current;
  })

  chunks.sort((a, b) => b.length - a.length);

  return chunks[0].length;
}
