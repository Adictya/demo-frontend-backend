import mqtt from "mqtt";
export const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", function () {
  client.subscribe("test-c2s", function (err) {
    if (!err) {
      console.log("test channel subscription successful");
    } else {
      console.log("test channel subscription failed", err);
    }
  });
});

client.on("message", async function (topic, message) {
  // message is Buffer
  const payload = await JSON.parse(message);
  console.log("Message recieved", payload.etyp);
  console.log(payload);
});
