import * as express from "express";
import * as R from "ramda";
import * as cors from "cors";
import { json, urlencoded } from "body-parser";
import { eventContext } from "aws-serverless-express/middleware";
import { join } from "path";
import { getBadgesForAddress } from "./badges";
import { updateRoots } from "./adminActions";

import discourseMessage from "./utils/discourseMessage";

require('dotenv').config()

export function configureApp() {
  const app = express();
  app.enable("trust proxy");
  app.set("trust proxy", true);
  app.set("view engine", "jade");

  app.use(express.static(join(__dirname, "public")));
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(eventContext());

  app.get("/", (req, res) => {
    res.json({ blah: "test" });
  });

  app.get("/address/:address", async (req, res) => {
    getBadgesForAddress(req.params.address)
      .then(badgeList => {
        res.json({ badges: badgeList });
      })
      .catch(e => {
        console.log(e);
      });
  });

  app.get("/update-roots", async (req, res) => {
    updateRoots();
    res.json({ success: true });
  });

  app.get("/discourse", (req, res) => {
    const validParams = ["username", "address", "signature"];
    const matchesQueryParams = k => { return R.contains(k, R.keys(req.query)); };

    if (!validParams.every(key => matchesQueryParams(key)))
      return res.json({ errors: ["Invalid request query, please check request params."] });

    discourseMessage(req.query)
      .then(response => {
        console.log("response:", response);
        res.status(200).json(response);
      })
      .catch(error => {
        console.log("error:", error);
        res.status(500).json(error);
      });

    return;
  });

  return app;
}
