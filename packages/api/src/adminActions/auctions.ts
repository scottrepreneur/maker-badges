import {
  ALL_FLIP_BIDS_QUERY,
  ALL_FLIP_WINS_QUERY,
  ALL_BITES_QUERY,
} from "../apollo/queries/auctions";
import { makerClient } from "../apollo/clients";
import {
  mapFrequenciesToProgressObject,
  addressListFilteredByFrequency
} from "../utils";
import {
  collateralFlippers,
  BATCH_QUERIES
} from "../constants";
import * as R from "ramda";
import * as _ from "lodash";

const makerAllBitesQuery = async function* (step = 0, collateral: string) {
  const query = await makerClient.query({
    query: ALL_BITES_QUERY,
    fetchPolicy: "cache-first",
    variables: { offset: step * 10000, collateral: collateral },
  });

  ++step;

  const hasNextPage = R.prop("hasNextPage", query.data.allBites.pageInfo);

  if (!hasNextPage) return { step, query };

  yield { step, query, hasNextPage };
};

function allBiteAddresses(flipper: string): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    let allResults: any[] = [];

    // Generator Function
    let query = makerAllBitesQuery(0, flipper);

    // Invoke GenFunc and start process
    let resultSet = await query.next();
    let nextPage = R.prop("hasNextPage", resultSet.value);

    do {
      const nodes = R.prop("nodes", resultSet.value.query.data.allBites);

      if (R.length(nodes) > 0)
        allResults.push(_.map(nodes, "tx.txFrom"));

      if (nextPage)
        resultSet = await query.next();

    } while (resultSet.done === false);

    // Resolve Promise
    resolve(allResults);
  });
}

export const allBitesAllFlippers = async () => {
  const results = await Promise.all(R.map(allBiteAddresses, Object.keys(collateralFlippers)));

  return _.flattenDeep(results);
};

export function biteAddressesForFrequency(
  frequency: number,
  biteAddresses: any[],
): { addresses: any[]; progress: Object } {
  const biteFreq = addressListFilteredByFrequency(biteAddresses)

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(biteFreq, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')

  const _progress = mapFrequenciesToProgressObject(biteFreq, frequency);

  return { addresses: _addresses, progress: _progress }
}

const makerAllFlipBidsQuery = async function* (step = 0) {
  const query = await makerClient.query({
    query: ALL_FLIP_BIDS_QUERY,
    fetchPolicy: "cache-first",
    variables: { offset: step * BATCH_QUERIES },
  });

  ++step;

  const hasNextPage = R.prop("hasNextPage", query.data.allFlipBidEvents.pageInfo);

  yield { step, query, hasNextPage };

  if (!hasNextPage) return { step, query };
};

export function allBidAddresses(): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    const allResults: any[] = [];

    // Generator Function
    let query = makerAllFlipBidsQuery(0);

    // Invoke GenFunc and start process
    let resultSet = await query.next();

    // Deff
    const fillResultsArray = eventNodes => {
      eventNodes.map((bid: any) => {
        if (bid.act === "TEND" || bid.act === "DENT") {
          allResults.push(R.prop("txFrom", bid.tx.nodes[0]));
        }

        return;
      });
    };

    // Loop
    do {
      const nodes = R.prop("nodes", resultSet.value.query.data.allFlipBidEvents);

      if (R.length(nodes) > 0)
        fillResultsArray(nodes);

      if (resultSet.value.hasNextPage)
        resultSet = await query.next();

    } while (resultSet.done === false);

    // Resolve Promise
    resolve(allResults);
  });
}

// for now, a tend and dent on the same auction are counted as 2 bids
export function bidAddressesForFrequency(
  frequency: number,
  addressList: string[]
): { addresses: any[]; progress: object } {

  const bidFreq = addressListFilteredByFrequency(addressList);

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(bidFreq, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')

  const _progress = mapFrequenciesToProgressObject(bidFreq, frequency);

  return {
    addresses: _addresses,
    progress: _progress,
  };
}

const makerAllFlipWinsQuery = async function* (step = 0, flipper: string) {

  const query = await makerClient.query({
    query: ALL_FLIP_WINS_QUERY,
    fetchPolicy: "cache-first",
    variables: {
      offset: step * BATCH_QUERIES,
      flipper: flipper,
    },
  });

  ++step;

  const hasNextPage = R.prop("hasNextPage", query.data.allFlipBidGuys.pageInfo);

  if (!hasNextPage) return { step, query };

  yield { step, query, hasNextPage };
};

const addressListFilteredByBidId = (list: { guy: string, bidId: string }[]): any[] => {
  return _.map(_.uniq(list), ((x) => {
    return {
      address: x.guy,
      frequency: _.size(_.filter(list, (bid) => {
        // get pollIds for current address
        return bid.guy === x.guy
      }))
    }
  }));
};

export const allBidGuysAllFlippers = async (): Promise<any[]> => {
  const results = await Promise.all(R.map(allBidGuyAddresses, Object.keys(collateralFlippers)));
  return _.flattenDeep(results);
};

export async function allBidGuyAddresses(flipper: string): Promise<{ address: string, frequency: number }[]> {
  return new Promise(async (resolve, reject) => {
    const allResults: any[] = [];

    // Generator Function
    let query = makerAllFlipWinsQuery(0, collateralFlippers[flipper]);

    // Invoke GenFunc and start process
    let resultSet = await query.next();

    // Deff
    const fillResultsArray = eventNodes => {
      eventNodes.map((bid: any) => {
        allResults.push({
          guy: R.prop("guy", bid),
          bidId: R.prop("bidId", bid)
        });
      });
    };

    // Loop
    do {
      const nodes = R.prop("nodes", resultSet.value.query.data.allFlipBidGuys);

      if (R.length(nodes) > 0)
        fillResultsArray(nodes);

      if (resultSet.value.hasNextPage)
        resultSet = await query.next();

    } while (resultSet.done === false);

    const zeroPred = R.whereEq({ guy: "0x0000000000000000000000000000000000000000" });
    const sorted = _.orderBy(allResults, ['bidId']);

    const zeroIndexes = _.keys(_.pickBy(sorted, zeroPred));
    const indexes = _.map(zeroIndexes, (x: any) => Number(++x));
    const filter = _.map(indexes, idx => sorted[idx]);

    // allResults.findIndex(a => a["bidId"] === e["bidId"]) === i;
    const filteredFrequencies = addressListFilteredByBidId(filter)
    // Resolve Promise
    resolve(filteredFrequencies);
  });
}

export function bidGuyAddressesForFrequency(
  frequency: number,
  addressList: { address: string, frequency: number }[]
): { addresses: any[]; progress: object } {
  // const bidGuyFreq = await allBidGuysAllFlippers();

  const greaterThanOrEqualToFrequency = (x: { address: string, frequency: number }) => {
    return x.frequency >= frequency;
  }

  const _addressList = _.filter(addressList, greaterThanOrEqualToFrequency)
  const _addresses = _.map(_addressList, 'address')

  const _progress = mapFrequenciesToProgressObject(addressList, frequency);

  return {
    addresses: _addresses,
    progress: _progress,
  }

}
