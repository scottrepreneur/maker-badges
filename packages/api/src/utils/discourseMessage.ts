import fetch from "node-fetch";
import { getBadgesForAddress } from "../badges";
import { ethers } from "ethers";
import { badgeMap } from "./badgeMap";
import { includes, isEmpty, isNumber, isNaN } from "lodash";

const DISCOURSE_BADGES_API: string = process.env.DISCOURSE_BADGES_API!;
const DISCOURSE_API_USERNAME: string = process.env.DISCOURSE_API_USERNAME!;
const DISCOURSE_FORUM_URL: string = process.env.DISCOURSE_FORUM_URL!;
const DISCOURSE_USER_BADGES_URL: string = process.env.DISCOURSE_USER_BADGES_URL!;

// ################################
let success: boolean = false;
let signer: any = undefined;
let badgeIds: any[] = [];
let badges: any[] = [];
let errors: any[] = [];
// ################################

// (((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))
// (((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))
const discourseMessage = async query => {
  errors = []; badgeIds = []; badges = [];

  return new Promise( async (resolve, reject) => {

    if (isBlank(query)) { errors.push("Missing query params"); reject(responseObject()); }

    if (!VerifyMessage(query)) { reject(responseObject()); }

    getBadgesForAddress(signer)
      .then(makerBadges    => { query.makerBadges = makerBadges; return query; })
      .then(query          => { return getUnlockedBadges(query); })
      .then(query          => { return getUserBadges(query); })
      .then(query          => { return grantUnlockedBadges(query); })
      .then(keepPromises   => { return Promise.all(keepPromises); })
      .then(()             => { success = true;     resolve(responseObject()); })
      .catch(error         => { errors.push(error); reject(responseObject());
    });
  });
};
// (((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))
// (((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const VerifyMessage = async msg => {
  try {
    signer = ethers.utils.verifyMessage(msg.username, msg.signature);

    if (signer && signer.toLowerCase() !== msg.address.toLowerCase())
      return false;
  }
  catch (error) { errors.push(error); return false; }
  finally {
    if (signer) { return true; }

    return false;
  }
};

const grantUnlockedBadges = (query) => {

  if (!query.unlockedBadges) { errors.push("No unlocked badges available");
    return;
  }

  if (query.unlockedBadges.length === 0) { errors.push("No eligible badges found.");
    return;
  }

  return query.unlockedBadges.map(async badge => {
    if (Object.keys(badgeMap).includes(badge.id.toString())) {

      // if user already unlocked badge, then move on to the next one
      if (includes(query.userBadges.map(b => b.id), badgeMap[badge.id])) {
        errors.push(`Badge [${badgeMap[badge.id]}] '${badge.name}' already unlocked for ${query.username}`);
        badges.push(badge);
        return new Promise(resolve => resolve());
      }

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Username": `${DISCOURSE_API_USERNAME}`,
          "Api-Key": `${DISCOURSE_BADGES_API}`,
        },
        body: JSON.stringify({
          username: query.username,
          badge_id: badgeMap[badge.id],
        }),
      };

      const response = await fetch(`${DISCOURSE_FORUM_URL}`, requestOptions);
      const json     = await response.json();

      if (response.status === 200) { badgeIds.push(badgeMap[badge.id]); badges.push(badge); }

      return json;
    }
  });
};

const getUnlockedBadges = (query) => { query.unlockedBadges = filterUnlockedBadges(query.makerBadges); return query; };
const getUserBadges = async (query) => { query.userBadges = await getUserBadgesFor(query.username); return query; };

const filterUnlockedBadges = (makerBadges) => {
  return makerBadges.filter(b => { return b.unlocked === 1; });
};

const getUserBadgesFor = (username) => {
  return new Promise(async resolve => {
    let userAccount = await fetch(`${DISCOURSE_USER_BADGES_URL}/${username}.json`);
    let userBadges  = await userAccount.json();

    resolve(userBadges.badges);
  })
};

const isBlank = value => { return (isEmpty(value) && !isNumber(value)) || isNaN(value); };

const responseObject = () => { return { success, errors, badgeIds, badges }; };
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default discourseMessage;
