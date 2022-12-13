import rtc from "agora-access-token";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";
import { users } from "./db.mjs";
import { client } from "./sock.mjs";
import * as dotenv from "dotenv";
dotenv.config();

const nanoid = customAlphabet("1234567890");

const { RtcTokenBuilder, RtcRole } = rtc;
const { sign, verify } = jwt;
// const { nanoid } = nid;

// import { RtcTokenBuilder, RtcRole } from "agora-access-token";
// import { sign, verify } from "jsonwebtoken";
// import { nanoid } from "nanoid";
import * as mqtt from "mqtt";
import express from "express";
import cors from "cors";

var app = express();
app.use(cors());
app.listen(3001, () => {
  console.log("Server running on port 3001");
});

const TOKEN_SECRET = process.env.TOKEN_SECRET;

// RTC
const appId = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

if (!appId) {
  console.log("Ask me for .env");
  process.exit();
}

const spaceID = 100;

// function generateAccessToken(username) {
//   return sign(username, TOKEN_SECRET);
// }
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader;
//   console.log(token);
//
//   if (token == null) return res.sendStatus(401);
//
//   verify(token, TOKEN_SECRET, (err, user) => {
//     console.log(err);
//
//     if (err) return res.sendStatus(403);
//
//     req.user = user;
//
//     next();
//   });
// }

function generateRtcToken(channel, uid, role) {
  console.log("tokenGenerated with ", {
    appId,
    appCertificate,
    channel,
    uid,
    role,
  });
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    role
  );

  console.log("tokenGenerated :", token);

  return token;
}

app.get("/tokenGenerate", async (req, res) => {
  let uid = nanoid();

  users[uid] = {
    uid,
    channel: uid + "0001",
    Client2ServerMqttTopic: uid + "c2s",
    Server2ClientMqttTopic: uid + "s2c",
  };

  client.subscribe(uid + "c2s", function (err) {
    if (!err) {
      console.log(uid + "channel subscription successful");
    } else {
      console.log(uid + "channel subscription failed", err);
    }
  });

  // const userToken = generateAccessToken(uid);

  res.json(uid);
});

app.get("/userDetails", (req, res) => {
  req.user = req.headers["authorization"];
  console.log(req.user);
  const channelName = users[req.user]?.channel;
  console.log(channelName);

  try {
    const token = generateRtcToken(channelName, req.user, RtcRole.AUDIENCE);
    client.on("message", async function (topic, message) {
      console.log("breakpiont with ", { topic, message });
      if (topic === req.user + "c2s") {
        const payload = await JSON.parse(message);
        if (payload.etyp === "Subscribe") {
          const token = generateRtcToken(
            users[payload.data.uid].channel,
            req.user,
            RtcRole.AUDIENCE
          );
          client.publish(
            req.user + "s2c",
            Buffer.from(
              JSON.stringify({
                etyp: "ChannelDetails",
                data: {
                  channel: users[payload.data.uid].channel,
                  rtcToken: token,
                },
              })
            )
          );
          console.log("message sent back", payload.etyp);
        }
      }
    });
    res.json({
      appId,
      uid: req.user,
      space_id: spaceID,
      selfChannel: channelName,
      selfChannelRtcToken: token,
      Client2ServerMqttTopic: users[req.user]?.Client2ServerMqttTopic,
      Server2ClientMqttTopic: users[req.user]?.Server2ClientMqttTopic,
    });
  } catch (e) {
    res.status(500);
    console.error(e);
  }
});
