import { governanceClient } from "../apollo/clients";
import { USER_POLL_VOTES_QUERY } from "../apollo/queries/governance";

export async function checkGovernancePollsCount(
  address: string,
  count: number,
) {
  const result = await governanceClient.query({
    query: USER_POLL_VOTES_QUERY,
    fetchPolicy: "cache-first",
    variables: {
      address: address.toLowerCase(),
    },
  });
  if (result.data.votePollActions.length >= count) {
    return 1;
  } else {
    return 0;
  }
}

export async function checkConsecutiveGovernancePollsCount(
  address: string,
  count: number,
) {
  return 1;
}
