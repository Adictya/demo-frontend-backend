import express from "express";
import cors from "cors";
import { users } from "./db.mjs";

import rtc from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = rtc;
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890");

var app = express();
app.use(cors());
app.listen(3001, () => {
  console.log("Server running on port 3001");
});

const appId = "76ccfa7d6cb2415a956a331c6d58fe36";
const appCertificate = "97319304176a4ef8bc753e2f97531742";
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;
const currentTimestamp = Math.floor(Date.now() / 1000);

app.get("/tokenGenerate", (req, res) => {
  let uid = nanoid();

  if (!users.channel) {
    users.channel = uid + "001";
  }
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    users.channel,
    uid,
    role
  );

  users[uid] = {
    uid,
    token,
    channel: users.channel,
  };

  res.json(users[uid]);
});
