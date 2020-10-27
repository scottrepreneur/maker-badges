import * as _ from 'lodash';
import { addOrUpdateTemplateRecord } from "../utils/aws";
import {
  allGovernancePollAddresses,
  pollVoteAddressesForFrequency,
  allExecutiveSpellAddresses,
  spellVoteAddressesForFrequency,
  allGovernancePollAddressesWithPollId,
  consecutivePollVoteAddressesForFrequency,
  allExecutiveSpellAddressesWithTimestamps,
  earlyExecutiveVoteAddressesForTime,
  allGovernancePollAddressesWithTimestamps,
  earlyPollVoteAddressesForTime,
} from "./governance";
import {
  allBitesAllFlippers,
  biteAddressesForFrequency,
  allBidAddresses,
  bidAddressesForFrequency,
  allBidGuysAllFlippers,
  bidGuyAddressesForFrequency,
} from "./auctions";
import { ZERO_ROOT } from '../constants';

import MerkleTree from "../utils/merkleTree";

export async function updateRoots() {
  // saving at least 1 dai in DSR
  console.log({ templateId: 1, dai_saved: 1 });

  // locking Dai in DSR for N (time) periods
  const daiInDsr = [
    { templateId: 2, periods: 3 },
    { templateId: 3, periods: 6 },
  ];
  daiInDsr.map(async periods => {
    console.log(periods);
  });

  // transfer N (amount) of Dai
  const daiTransferred = [
    { templateId: 4, amount: 10 },
    { templateId: 5, amount: 100 },
  ];
  daiTransferred.map(async amount => {
    console.log(amount);
  });

  // voting on at least N (frequency) governance polls
  const governanceVoteFrequencies = [
    { templateId: 6, frequency: 1 },
    { templateId: 7, frequency: 5 },
    { templateId: 8, frequency: 10 },
    { templateId: 9, frequency: 20 },
    { templateId: 10, frequency: 50 },
    { templateId: 11, frequency: 100 },
  ];
  const govVoteAddresses = await allGovernancePollAddresses();

  governanceVoteFrequencies.map(freq => {
    const govVoteAddressList = pollVoteAddressesForFrequency(freq.frequency, govVoteAddresses);
    if (govVoteAddressList.addresses && _.size(govVoteAddressList.addresses) > 0) {
      const tree = new MerkleTree(govVoteAddressList.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          govVoteAddressList.addresses,
          tree.getHexRoot(),
          govVoteAddressList.progress,
        );
      }
      console.log(
        freq.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No Addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // voting on N (frequency) consecutive governance polls
  const consecutiveGovernancePollFrequencies = [
    { templateId: 12, frequency: 2 },
    { templateId: 13, frequency: 5 },
    { templateId: 14, frequency: 10 },
  ];
  const governancePollAddresses = await allGovernancePollAddressesWithPollId();

  consecutiveGovernancePollFrequencies.map(freq => {
    const consecutiveAddresses = consecutivePollVoteAddressesForFrequency(freq.frequency, governancePollAddresses);

    if (consecutiveAddresses.addresses && _.size(consecutiveAddresses.addresses) > 0) {
      const tree = new MerkleTree(consecutiveAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          consecutiveAddresses.addresses,
          tree.getHexRoot(),
          consecutiveAddresses.progress,
        );
      }
      console.log(
        freq.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No Addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // voting on at least N (frequency) executive proposals (spells)
  const executiveSpellFrequencies = [
    { templateId: 15, frequency: 1 },
    { templateId: 16, frequency: 5 },
    { templateId: 17, frequency: 10 },
    { templateId: 18, frequency: 20 },
    { templateId: 19, frequency: 50 },
  ];
  const execSpellAddresses = await allExecutiveSpellAddresses();

  executiveSpellFrequencies.map(freq => {
    const execAddresses = spellVoteAddressesForFrequency(freq.frequency, execSpellAddresses);

    if (execAddresses.addresses && _.size(execAddresses.addresses) > 0) {
      const tree = new MerkleTree(execAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          execAddresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          execAddresses.progress || {},
        );
      }
      console.log(
        freq.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No Addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // early voter on Executive Spell (within 60 minutes of creation)
  const earlyExecutiveVotes = [{ templateId: 20, time: 3600 }];
  const executiveAddressesWithTimestamp = await allExecutiveSpellAddressesWithTimestamps();

  earlyExecutiveVotes.map(time => {
    const earlyExecutiveAddresses = earlyExecutiveVoteAddressesForTime(time.time, executiveAddressesWithTimestamp);

    if (earlyExecutiveAddresses.addresses && _.size(earlyExecutiveAddresses.addresses) > 0) {
      const tree = new MerkleTree(earlyExecutiveAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          time.templateId,
          earlyExecutiveAddresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          earlyExecutiveAddresses.progress || {},
        );
      }
      console.log(
        time.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No Addresses for template #' + time.templateId)

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(time.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // early voter on governance poll (within 60 minutes of start time)
  const earlyPollVotes = [{ templateId: 21, time: 3600 }];
  const govVoteAddressesWithTimestamp = await allGovernancePollAddressesWithTimestamps()

  earlyPollVotes.map(time => {
    const addresses = earlyPollVoteAddressesForTime(time.time, govVoteAddressesWithTimestamp);
    if (addresses.addresses && _.size(addresses.addresses) > 0) {
      const tree = new MerkleTree(addresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          time.templateId,
          addresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          addresses.progress || {},
        );
      }
      console.log(
        time.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No addresses for template #' + time.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(time.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // biting at least N (frequency) unsafe Vaults
  const bitingVaultsFrequencies = [
    { templateId: 22, frequency: 1 },
    { templateId: 23, frequency: 10 },
    { templateId: 24, frequency: 50 },
    { templateId: 25, frequency: 100 },
  ];
  const allBiteAddresses = await allBitesAllFlippers();

  bitingVaultsFrequencies.map(freq => {
    const biteAddresses = biteAddressesForFrequency(freq.frequency, allBiteAddresses);

    if (biteAddresses.addresses && _.size(biteAddresses.addresses) > 0) {
      const tree = new MerkleTree(biteAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          biteAddresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          biteAddresses.progress || {},
        );
      }
      console.log(
        freq.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // bidding on at least N (frequency) collateral auctions
  const bidCollateralAuctionFrequencies = [
    { templateId: 26, frequency: 1 },
    { templateId: 27, frequency: 5 },
    { templateId: 28, frequency: 10 },
    { templateId: 29, frequency: 25 },
  ];
  const allBidAddressList = await allBidAddresses();

  bidCollateralAuctionFrequencies.map(freq => {
    const bidAddresses = bidAddressesForFrequency(freq.frequency, allBidAddressList)

    if (bidAddresses.addresses && _.size(bidAddresses.addresses) > 0) {

      const tree = new MerkleTree(bidAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          bidAddresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          bidAddresses.progress || {},
        );
      }

      console.log(
        freq.templateId,
        tree.getHexRoot() || ZERO_ROOT,
      );
    } else {
      console.log('No Addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }

    return;
  });

  // winning at least N (frequency) collateral auctions
  const winCollateralAuctionFrequencies = [
    { templateId: 30, frequency: 1 },
    { templateId: 31, frequency: 5 },
    { templateId: 32, frequency: 10 },
    { templateId: 33, frequency: 25 },
  ];
  const allBidGuyAddressList = await allBidGuysAllFlippers();

  winCollateralAuctionFrequencies.map(freq => {
    const bidGuyAddresses = bidGuyAddressesForFrequency(freq.frequency, allBidGuyAddressList)
    if (bidGuyAddresses.addresses && _.size(bidGuyAddresses.addresses) > 0) {
      const tree = new MerkleTree(bidGuyAddresses.addresses);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(
          freq.templateId,
          bidGuyAddresses.addresses || [],
          tree.getHexRoot() || ZERO_ROOT,
          bidGuyAddresses.progress || {},
        );
      }

      console.log(freq.templateId, tree.getHexRoot() || ZERO_ROOT);
    } else {
      console.log('No Addresses for template #' + freq.templateId);

      if (process.env.ENVIRONMENT === "production") {
        addOrUpdateTemplateRecord(freq.templateId, [], ZERO_ROOT, {});
      }
    }
  });
}
