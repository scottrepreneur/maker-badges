import {
  checkTemplateAddressesForAddressList,
  // checkTemplateProgressForAddressList,
  checkForProxyAddresses,
} from "./utils";
import { USER_DAI_TRANSFERS_QUERY } from "./apollo/queries/dai";
import { daiClient } from "./apollo/clients";
import { getTemplate } from "./utils/aws";
import MerkleTree from "./utils/merkleTree";

// HARDER TO TRACK IDEAS

//  Propose a new Maker project
//  Contribute to an existing project/bounty
//  Get a development grant
//  Translate content
//  Apply to be a translator
//  Apply to be a translator reviewer
//  Create new content for comm-dev
//  Edit existing content
//  Improve Maker knowledge
//  E.g. learn about vaults, voting, governance etc.
//  Get resources for working with Maker
//  E.g. writing style guide, visual style guide, assets
//  Join a governance meeting
//  Take notes at a meeting
//  Get Maker to take part in Hackathon (sponsorship/mentorship)

const badgeList = {
  MKR1: {
    id: 1,
    parent: 0,
    tier: 1,
    name: "Accrue 1 Dai from DSR",
    longName: "Accrue 1 Dai from the Dai Savings Rate",
    description:
      "Accruing Dai in the Dai Savings Rate is a great way to earn while maintaining the value of your holdings. You can start accumulating with Dai from an exchange. Accrue 1 Dai by locking Dai in Oasis Save to unlock this achievement.",
    resource: "https://oasis.app/save",
    steps: {
      1: "Head over to Oasis Save and unlock your Web3 wallet",
      2: "Select Deposit and enter an amount to deposit",
      3: "Sign the transaction and come back when you've accrued enough Dai from the DSR",
    },
    note: "",
    imgPath: "mkr_1_dai_locked_1.png",
  },
  MKR2: {
    id: 2,
    parent: 1,
    tier: 2,
    name: "Earn in DSR for 3 months",
    longName: "Lock 10 Dai from the Dai Savings Rate",
    description:
      "Accruing Dai in the Dai Savings Rate is a great way to earn while maintaining the value of your holdings. You can start accumulating with Dai from an exchange. Earn on 10 locked Dai in DSR for 3 months to unlock this achievement.",
    resource: "https://oasis.app/save",
    steps: {
      1: "Head over to Oasis Save and unlock your Web3 wallet",
      2: "Select Deposit and enter an amount to deposit (above 10)",
      3: "Sign the transaction and come back when you've locked enough Dai for long enough",
    },
    note: "",
    imgPath: "mkr_2_dai_locked_2.png",
  },
  MKR3: {
    id: 3,
    parent: 2,
    tier: 3,
    name: "Earn in DSR for 6 months",
    longName: "Earn on 10 locked Dai in DSR for 6 months",
    description:
      "Accruing Dai in the Dai Savings Rate is a great way to earn while maintaining the value of your holdings. You can start accumulating with Dai from an exchange. Earn on 10 locked Dai in DSR for 6 months to unlock this achievement.",
    resource: "https://oasis.app/save",
    steps: {
      1: "Head over to Oasis Save and unlock your Web3 wallet",
      2: "Select Deposit and enter an amount to deposit (above 10)",
      3: "Sign the transaction and come back when you've locked enough Dai for long enough",
    },
    note: "",
    imgPath: "mkr_3_dai_locked_3.png",
  },
  MKR4: {
    id: 4,
    parent: 0,
    tier: 1,
    name: "Send 10 Dai",
    longName: "Send 10 Dai",
    description:
      "Sending Dai is the backbone of the decentralized ecosystem. Send 10 Dai for gifts, rent, or returning the favor to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to your Web3 wallet and unlock it",
      2: "Send at least 10 Dai to another address",
    },
    note: "",
    imgPath: "mkr_4_dai_sent_1.png",
  },
  MKR5: {
    id: 5,
    parent: 4,
    tier: 2,
    name: "Send 20 Dai",
    longName: "Send 20 Dai",
    description:
      "Sending Dai is the backbone of the decentralized ecosystem. Send 100 Dai for gifts, rent, or returning the favor to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to your Web3 wallet and unlock it",
      2: "Send at least 100 Dai to another address",
    },
    note: "",
    imgPath: "mkr_5_dai_sent_2.png",
  },
  MKR6: {
    id: 6,
    parent: 0,
    tier: 1,
    name: "Vote on a Governance Poll",
    longName: "Vote on one Governance Poll",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on a Governance Poll to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on a Governance Poll",
    },
    note: "",
    imgPath: "mkr_6_poll_1.png",
  },
  MKR7: {
    id: 7,
    parent: 6,
    tier: 2,
    name: "Vote on 5 Governance Polls",
    longName: "Vote on at least 5 Governance Polls",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on 5 Governance Polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on 5 Governance Polls",
    },
    note: "",
    imgPath: "mkr_7_poll_2.png",
  },
  MKR8: {
    id: 8,
    parent: 7,
    tier: 3,
    name: "Vote on 10 Governance Polls",
    longName: "Vote on at least 10 Governance Polls",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on 10 Governance Polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on 10 Governance Polls",
    },
    note: "",
    imgPath: "mkr_8_poll_3.png",
  },
  MKR9: {
    id: 9,
    parent: 8,
    tier: 4,
    name: "Vote on 20 Governance Polls",
    longName: "Vote on at least 20 Governance Polls",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on 20 Governance Polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on 20 Governance Polls",
    },
    note: "",
    imgPath: "mkr_9_poll_4.png",
  },
  MKR10: {
    id: 10,
    parent: 9,
    tier: 5,
    name: "Vote on 50 Governance Polls",
    longName: "Vote on at least 50 Governance Polls",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on 50 Governance Polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on 50 Governance Polls",
    },
    note: "",
    imgPath: "mkr_10_poll_5.png",
  },
  MKR11: {
    id: 11,
    parent: 10,
    tier: 6,
    name: "Vote on 100 Governance Polls",
    longName: "Vote on at least 100 Governance Polls",
    description:
      "Driving decision making through on-chain consensus is a determining aspect of scientific governance. On-chain polling is done to understand sentiment from token holders around actions taken for risk parameters. Vote on 100 Governance Polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on 100 Governance Polls",
    },
    note: "",
    imgPath: "mkr_11_poll_6.png",
  },
  MKR12: {
    id: 12,
    parent: 6,
    tier: 1,
    name: "Vote on 2 consecutive Governance Polls",
    longName: "Vote on at least 2 consecutive Governance Polls",
    description:
      "Governance requires regular decisions to sufficiently govern. Consensus requires many voices to be heard. Vote on consecutive governance polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Since you've successfully voted in one Governance Poll, you can head over to the Governance portal to cast another vote.",
      2: "Register a vote in back-to-back Governance Polls",
    },
    note:
      "Polls are indexed by deploy timestamp but not necessarily ordered in the voting interface",
    imgPath: "mkr_12_consecutive_poll_1.png",
  },
  MKR13: {
    id: 13,
    parent: 12,
    tier: 2,
    name: "Vote on 5 consecutive Governance Polls",
    longName: "Vote on at least 5 consecutive Governance Polls",
    description:
      "Governance requires regular decisions to sufficiently govern. Consensus requires many voices to be heard. Vote on 5 consecutive governance polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Since you've successfully voted in one Governance Poll, you can head over to the Governance portal to cast another vote.",
      2: "Register a vote in 5 sequential Governance Polls",
    },
    note:
      "Polls are indexed by deploy timestamp but not necessarily ordered in the voting interface",
    imgPath: "mkr_13_consecutive_poll_2.png",
  },
  MKR14: {
    id: 14,
    parent: 13,
    tier: 3,
    name: "Vote on 10 consecutive Governance Polls",
    longName: "Vote on at least 10 consecutive Governance Polls",
    description:
      "Governance requires regular decisions to sufficiently govern. Consensus requires many voices to be heard. Vote on 10 consecutive governance polls to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Since you've successfully voted in one Governance Poll, you can head over to the Governance portal to cast another vote.",
      2: "Register a vote in 10 consecutive Governance Polls",
    },
    note:
      "Polls are indexed by deploy timestamp but not necessarily ordered in the voting interface",
    imgPath: "mkr_14_consecutive_poll_3.png",
  },
  MKR15: {
    id: 15,
    parent: 0,
    tier: 1,
    name: "Vote on an Executive Proposal",
    longName: "Vote on one Executive Vote<br>to enact a new Proposal",
    description:
      "Using Continuous Approval Voting, governance is able to implement progressive changes while protecting the system from unintended changes. Vote on an Executive Proposal to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on one Executive Proposal",
    },
    note: "",
    imgPath: "mkr_15_spell_1.png",
  },
  MKR16: {
    id: 16,
    parent: 15,
    tier: 2,
    name: "Vote on 5 Executive Proposals",
    longName: "Vote on five Executive Votes<br>to upgrade the Maker System",
    description:
      "Using Continuous Approval Voting, governance is able to implement progressive changes while protecting the system from unintended changes. Vote on 5 Executive Proposals to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on five Executive Proposals",
    },
    note: "",
    imgPath: "mkr_16_spell_2.png",
  },
  MKR17: {
    id: 17,
    parent: 16,
    tier: 3,
    name: "Vote on 10 Executive Proposals",
    longName: "Vote on ten Executive Votes<br>to upgrade the Maker System",
    description:
      "Using Continuous Approval Voting, governance is able to implement progressive changes while protecting the system from unintended changes. Vote on 10 Executive Proposals to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on ten Executive Proposals",
    },
    note: "",
    imgPath: "mkr_17_spell_3.png",
  },
  MKR18: {
    id: 18,
    parent: 17,
    tier: 4,
    name: "Vote on 20 Executive Proposals",
    longName: "Vote on twenty Executive Vote<br>to upgrade the Maker System",
    description:
      "Using Continuous Approval Voting, governance is able to implement progressive changes while protecting the system from unintended changes. Vote on 20 Executive Proposals to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on twenty Executive Proposals",
    },
    note: "",
    imgPath: "mkr_18_spell_4.png",
  },
  MKR19: {
    id: 19,
    parent: 18,
    tier: 5,
    name: "Vote on 50 Executive Proposals",
    longName: "Vote on fifty Executive Vote<br>to upgrade the Maker System",
    description:
      "Using Continuous Approval Voting, governance is able to implement progressive changes while protecting the system from unintended changes. Vote on 50 Executive Proposals to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on 50 Executive Proposals",
    },
    note: "",
    imgPath: "mkr_19_spell_5.png",
  },
  MKR20: {
    id: 20,
    parent: 15,
    tier: 1,
    name: "First Executive Voter",
    longName: "Be one of the first voters on<br>a new Executive Proposal",
    description:
      "Vote on an Executive Proposal within an hour of its creation to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet and set up a voting proxy",
      3: "Cast a vote on an Executive Proposal in the first hour after it has been deployed on chain",
    },
    note: "",
    imgPath: "mkr_20_early_spell_1.png",
  },
  MKR21: {
    id: 21,
    parent: 6,
    tier: 1,
    name: "First Governance Poller",
    longName: "Be one of the first voters on<br>a new Governance Poll",
    description:
      "Vote on a Governance Poll within an hour of its creation to unlock this achievement.",
    resource: "https://vote.makerdao.com",
    steps: {
      1: "Head over to the Governance Portal",
      2: "Unlock your Web3 wallet",
      3: "Register a vote on a Governance Poll in the first hour after it's start time",
    },
    note:
      "Governance Polls have specified start times rather than being available when deployed",
    imgPath: "mkr_21_early_poll_1.png",
  },
  MKR22: {
    id: 22,
    parent: 0,
    tier: 1,
    name: "Bite an unsafe Vault",
    longName: "Bite an unsafe Vault",
    description:
      "In order to keep Dai stable MKR holders need to ensure collateral can be swiftly swapped to repay Dai debt. Help maintain the system by biting a vault that is below the required collateralization ratio to unlock this achievement.",
    resource: "https://app.keeperdao.com",
    steps: {
      1: "KeeperDAO.com and Atomica.org are running pooled keepers",
      2: "Alternatively run your own keeper bot, though this route is more advanced.",
      3: "Once you've chosen one of these options keep an eye out (probably automatically) for unsafe vaults and call the bite() function to trigger the collateral auction",
    },
    note: "",
    imgPath: "mkr_22_bite_1.png",
  },
  MKR23: {
    id: 23,
    parent: 22,
    tier: 2,
    name: "Bite 10 unsafe Vaults",
    longName: "Bite at least 10 unsafe Vaults",
    description:
      "In order to keep Dai stable MKR holders need to ensure collateral can be swiftly swapped to repay Dai debt. Help maintain the system by biting 10 vaults that are below the required collateralization ratio to unlock this achievement.",
    resource: "https://app.keeperdao.com",
    steps: {
      1: "KeeperDAO.com and Atomica.org are running pooled keepers",
      2: "Alternatively run your own keeper bot, though this route is more advanced.",
      3: "Once you've chosen one of these options keep an eye out (probably automatically) for unsafe vaults and call the bite() function to trigger the collateral auction for 10 unsafe vaults",
    },
    note: "",
    imgPath: "mkr_23_bite_2.png",
  },
  MKR24: {
    id: 24,
    parent: 23,
    tier: 3,
    name: "Bite 50 unsafe Vaults",
    longName: "Bite at least fifty unsafe Vaults",
    description:
      "In order to keep Dai stable MKR holders need to ensure collateral can be swiftly swapped to repay Dai debt. Help maintain the system by biting 50 vaults that are below the required collateralization ratio to unlock this achievement.",
    resource: "https://app.keeperdao.com",
    steps: {
      1: "KeeperDAO.com and Atomica.org are running pooled keepers",
      2: "Alternatively run your own keeper bot, though this route is more advanced.",
      3: "Once you've chosen one of these options keep an eye out (probably automatically) for unsafe vaults and call the bite() function to trigger the collateral auction for 50 unsafe vaults",
    },
    note: "",
    imgPath: "mkr_24_bite_3.png",
  },
  MKR25: {
    id: 25,
    parent: 24,
    tier: 4,
    name: "Bite 100 unsafe Vault",
    longName: "Bite at least 100 unsafe Vaults",
    description:
      "In order to keep Dai stable MKR holders need to ensure collateral can be swiftly swapped to repay Dai debt. Help maintain the system by biting 100 vaults that are below the required collateralization ratio to unlock this achievement.",
    resource: "https://app.keeperdao.com",
    steps: {
      1: "KeeperDAO.com and Atomica.org are running pooled keepers",
      2: "Alternatively run your own keeper bot, though this route is more advanced.",
      3: "Once you've chosen one of these options keep an eye out (probably automatically) for unsafe vaults and call the bite() function to trigger the collateral auction for 100 unsafe vaults",
    },
    note: "",
    imgPath: "mkr_25_bite_4.png",
  },
  MKR26: {
    id: 26,
    parent: 0,
    tier: 1,
    name: "Bid on a Collateral Auction",
    longName: "Bid on a Collateral Auction",
    description:
      "Once unsafe vaults are bitten the collateral is swapped for Dai to pay back the outstanding debt. Help the system and keep stable bids on collateral. Bid on a collateral auction from a liquidated vault to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Place a bid on a collateral auction",
    },
    note: "Includes Tend and Dent bids",
    imgPath: "mkr_26_flip_bid_1.png",
  },
  MKR27: {
    id: 27,
    parent: 26,
    tier: 2,
    name: "Bid on 5 Collateral Auctions",
    longName: "Bid on 5 Collateral Auction",
    description:
      "Once unsafe vaults are bitten the collateral is swapped for Dai to pay back the outstanding debt. Help the system and keep stable bids on collateral. Bid on 5 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Place a bid on 5 collateral auctions",
    },
    note: "Includes Tend and Dent bids",
    imgPath: "mkr_27_flip_bid_2.png",
  },
  MKR28: {
    id: 28,
    parent: 27,
    tier: 3,
    name: "Bid on 10 Collateral Auctions",
    longName: "Bid on 10 Collateral Auctions",
    description:
      "Once unsafe vaults are bitten the collateral is swapped for Dai to pay back the outstanding debt. Help the system and keep stable bids on collateral. Bid on 10 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Place a bid on 10 collateral auctions",
    },
    note: "Includes Tend and Dent bids",
    imgPath: "mkr_28_flip_bid_3.png",
  },
  MKR29: {
    id: 29,
    parent: 28,
    tier: 4,
    name: "Bid on 25 Collateral Auctions",
    longName: "Bid on 25 Collateral Auctions",
    description:
      "Once unsafe vaults are bitten the collateral is swapped for Dai to pay back the outstanding debt. Help the system and keep stable bids on collateral. Bid on 25 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Place a bid on 25 collateral auctions",
    },
    note: "Includes Tend and Dent bids",
    imgPath: "mkr_29_flip_bid_4.png",
  },
  MKR30: {
    id: 30,
    parent: 26,
    tier: 1,
    name: "Won a Collateral Auction",
    longName: "Won a Collateral Auction",
    description:
      "Be the winner of a collateral auction from a liquidated vault to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Call the Deal() function to complete an auction and finalize the collateral and Dai swap",
    },
    note: "",
    imgPath: "mkr_30_flip_win_1.png",
  },
  MKR31: {
    id: 31,
    parent: 30,
    tier: 2,
    name: "Won 5 Collateral Auctions",
    longName: "Won 5 Collateral Auctions",
    description:
      "Be the winner of 5 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Call the Deal() function to complete 5 auctions and finalize the collateral and Dai swaps",
    },
    note: "",
    imgPath: "mkr_31_flip_win_2.png",
  },
  MKR32: {
    id: 32,
    parent: 31,
    tier: 3,
    name: "Won 10 Collateral Auctions",
    longName: "Won 10 Collateral Auctions",
    description:
      "Be the winner of 10 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Call the Deal() function to complete 10 auctions and finalize the collateral and Dai swaps",
    },
    note: "",
    imgPath: "mkr_32_flip_win_3.png",
  },
  MKR33: {
    id: 33,
    parent: 32,
    tier: 4,
    name: "Won 25 Collateral Auctions",
    longName: "Won 25 Collateral Auctions",
    description:
      "Be the winner of 25 collateral auctions from liquidated vaults to unlock this achievement.",
    resource: "https://defiexplore.com/liquidations",
    steps: {
      1: "Head over to an auctions portal (Dai Auctions/Defi Explore)",
      2: "Connect your Web3 wallet",
      3: "Call the Deal() function to complete 25 auctions and finalize the collateral and Dai swaps",
    },
    note: "",
    imgPath: "mkr_33_flip_win_4.png",
  },
};

// MKR6: {
//   id: 6,
//   parent: 0,
//   tier: 1,
//   name: "Join the PoolTogether savings game",
//   longName: "Join the PoolTogther savings game",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   progress: 0,
//   proof: [],
//   root: "",
// },
// MKR7: {
//   id: 7,
//   parent: 0,
//   tier: 1,
//   name: "Lend Dai on Compound",
//   longName: "Lend Dai on Compound",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   progress: 0,
//   proof: [],
//   root: "",
// },

// *** SET PARENT AND TIER *** //
// MKR36: {
//   id: 36,
//   name: "Bid on a Surplus Auction",
//   longName: "Bid on a Surplus Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR37: {
//   id: 37,
//   name: "Bid on 5 Surplus Auctions",
//   longName: "Bid on 5 Surplus Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR38: {
//   id: 38,
//   name: "Bid on 10 Surplus Auctions",
//   longName: "Bid on 10 Surplus Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR39: {
//   id: 39,
//   name: "Bid on 25 Surplus Auctions",
//   longName: "Bid on 25 Surplus Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR40: {
//   id: 40,
//   name: "Won a Surplus Auction",
//   longName: "Won a Surplus Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR41: {
//   id: 41,
//   name: "Won 5 Surplus Auctions",
//   longName: "Won 5 Surplus Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR42: {
//   id: 42,
//   name: "Won 10 Surplus Auctions",
//   longName: "Won 10 Surplus Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR43: {
//   id: 43,
//   name: "Won 25 Surplus Auctions",
//   longName: "Won 25 Surplus Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR44: {
//   id: 44,
//   name: "Bid on a Debt Auction",
//   longName: "Bid on a Debt Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR45: {
//   id: 45,
//   name: "Bid on 5 Debt Auctions",
//   longName: "Bid on 5 Debt Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR46: {
//   id: 46,
//   name: "Bid on 10 Debt Auctions",
//   longName: "Bid on 10 Debt Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR47: {
//   id: 47,
//   name: "Bid on 25 Debt Auctions",
//   longName: "Bid on 25 Debt Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR48: {
//   id: 48,
//   name: "Won a Debt Auction",
//   longName: "Won a Debt Auction",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR49: {
//   id: 49,
//   name: "Won 5 Debt Auctions",
//   longName: "Won 5 Debt Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR50: {
//   id: 50,
//   name: "Won 10 Debt Auctions",
//   longName: "Won 10 Debt Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR51: {
//   id: 51,
//   name: "Won 25 Debt Auctions",
//   longName: "Won 25 Debt Auctions",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "quick-vote-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR52: {
//   id: 52,
//   name: "MKR in Voting Contract for 3 months",
//   longName: "Secure MKR Governance with your<br>MKR for at least 3 months",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "lock-mkr-x3-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR53: {
//   id: 53,
//   name: "MKR in Voting Contract for 6 months",
//   longName: "Secure MKR Governance with your<br>MKR for at least 6 months",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "lock-mkr-x3-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR54: {
//   id: 54,
//   name: "MKR in Voting Contract for 12 months",
//   longName: "Secure MKR Governance with your<br>MKR for at least 12 months",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "lock-mkr-x12-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR55: {
//   id: 55,
//   name: "Enact a Proposal",
//   longName: "Cast the Spell to enact the<br>proposal contained in the Spell",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://etherscan.io",
//   imgPath: "cast-spell-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR56: {
//   id: 56,
//   name: "Create a Proposal that gets 10 votes",
//   longName:
//     "Create an Executive Proposal that<br>accumulates at least 10 voters",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-10-votes-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR57: {
//   id: 57,
//   name: "Create a Proposal that is passed",
//   longName:
//     "Create an Executive Proposal<br>that is passed by MKR Governance",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR58: {
//   id: 58,
//   name: "Create 5 Proposals that pass",
//   longName:
//     "Create an Executive Proposal<br>that is passed by MKR Governance",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR59: {
//   id: 59,
//   name: "Create 10 Proposals that pass",
//   longName:
//     "Create an Executive Proposal<br>that is passed by MKR Governance",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR60: {
//   id: 60,
//   name: "Create a Governance Poll",
//   longName:
//     "Create a Governance Poll to<br />establish MKR governance sentiment",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR61: {
//   id: 61,
//   name: "Create 5 Governance Polls",
//   longName:
//     "Create 5 Governance Polls to<br />establish MKR governance sentiment",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR62: {
//   id: 62,
//   name: "Create 10 Governance Polls",
//   longName:
//     "Create 10 Governance Polls to<br />establish MKR governance sentiment",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// MKR63: {
//   id: 63,
//   name: "Create 25 Governance Polls",
//   longName:
//     "Create 25 Governance Polls to<br />establish MKR governance sentiment",
//   description:
//     "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//   resource: "https://vote.makerdao.com",
//   imgPath: "spell-is-cast-badge.svg",
//   unlocked: 0,
//   redeemed: 0,
//   proof: "",
// },
// };

// const limited_badges = {
//   LMKR1: {
//     name: "Casted SCD Shutdown Spell",
//     longName: "Cast SCD Shutdown Spell",
//     description:
//       "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//     resource: "https://vote.makerdao.com",
//     imgPath: "spell-is-cast-badge.svg",
//     unlocked: 0,
//     redeemed: 0,
//   },
//   LMKR2: {
//     name: "Casted MCD Launch Spell",
//     longName: "Cast MCD Launch Spell",
//     description:
//       "Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
//     resource: "https://vote.makerdao.com",
//     imgPath: "spell-is-cast-badge.svg",
//     unlocked: 0,
//     redeemed: 0,
//   },
// };

export async function getBadgesForAddress(_address: string) {
  const addressList = await checkForProxyAddresses(_address);

  return Promise.all(
    Object.keys(badgeList).map(async key => {
      let badge = badgeList[key];
      badge = {
        ...badge,
        progress: 0,
        unlocked: 0,
        verified: 0,
        redeemed: 0,
        completedAddress: "0x",
        proof: [],
        root: "",
      };

      // WORKAROUND FOR FORUM ROLL OUT

      // if (key === 'MKR1') {
      //   console.log('test')
      // }

      if (key === "MKR1") {
        
      } else if (key === "MKR2") {

      } else if (key === "MKR3") {

      } else if (key === "MKR4") {
        const result = await daiClient.query({
          query: USER_DAI_TRANSFERS_QUERY,
          fetchPolicy: "cache-first",
          variables: {
            address: _address.toLowerCase(),
          },
        });

        let sent = 0;
        if (result.data && result.data.transfers.length > 0) {
          for (let i = 0; i < result.data.transfers.length; i++) {
            sent = sent + parseInt(result.data.transfers[i]["wad"]);
            if (sent > 11) {
              break;
            }
          }
        }

        if (sent > 10) {
          badge.unlocked = 1;
          badge.completedAddress = _address;
        }
      } else if (key === "MKR5") {
        const result = await daiClient.query({
          query: USER_DAI_TRANSFERS_QUERY,
          fetchPolicy: "cache-first",
          variables: {
            address: _address.toLowerCase(),
          },
        });

        let sent = 0;
        if (result.data && result.data.transfers.length > 0) {
          for (let i = 0; i < result.data.transfers.length; i++) {
            sent = sent + parseInt(result.data.transfers[i]["wad"]);
            if (sent > 101) {
              break;
            }
          }
        }

        if (sent > 100) {
          badge.unlocked = 1;
          badge.completedAddress = _address;
        }
      } else {
        // STANDARD IMPLEMENTATION
        let template = await getTemplate(parseFloat(key.slice(3, key.length)));
        // if (template.progress != {}) {
        //   // if (template.progress[_address]) {
        //   //   badge.progress = template.progress[_address];
        //   // }
        //   badge.progress = await checkTemplateProgressForAddressList(
        //     addressList,
        //     template.progress,
        //   );
        // }

        if (template.addresses.length > 0) {
          let tree = new MerkleTree(template.addresses);
          badge.root = tree.getHexRoot();

          badge.completedAddress = await checkTemplateAddressesForAddressList(
            addressList,
            template.addresses,
          );

          if (badge.completedAddress !== "0x") {
            badge.unlocked = 1;
          }

          if (badge.unlocked && !badge.redeemed) {
            badge.proof = tree.getHexProof(badge.completedAddress);
          }
        }
      }

      return badge;
    }),
  );
}
