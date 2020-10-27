import { ALL_FLIP_BIDS_QUERY } from "../apollo/queries/auctions";
import { makerClient } from "../apollo/clients";

export async function checkFlipBidsCountForAddress(
  address: string,
  count: number,
) {
  const result = await makerClient.query({
    query: ALL_FLIP_BIDS_QUERY,
    fetchPolicy: "cache-first",
  });
  const bids = result.data.allFlipBidEvents.nodes
    .map((bid: any) => {
      if (bid.tx.nodes.txFrom === address) {
        return 1;
      } else {
        return null;
      }
    })
    .filter((el: any) => {
      el !== null;
    });
  if (bids.length >= count) {
    return 1;
  } else {
    return 0;
  }
}

export function checkFlipWinsCountForAddress(address: string, count: number) {
  return 1;
}

export function checkFlapBidsCountForAddress(address: string, count: number) {
  return 1;
}

export function checkFlapWinsCountForAddress(address: string, count: number) {
  return 1;
}

export function checkFlopBidsCountForAddress(address: string, count: number) {
  return 1;
}

export function checkFlopWinsCountForAddress(address: string, count: number) {
  return 1;
}
