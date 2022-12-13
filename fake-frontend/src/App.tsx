import { useEffect, useState } from "react";
import SuperSdk from "app-builder-super-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";

const init = async () => {
  const res = await fetch("http://localhost:3001/tokenGenerate");
  const token = await res.json();

  await SuperSdk.start(token);
  const track = await navigator.mediaDevices.getUserMedia({ audio: true });
  SuperSdk.produceStart("userAudio", track.getTracks()[0]);
};

const destroy = () => {
  SuperSdk.destroy();
};

let playing = false;

function App() {
  const [subUid, setSubUid] = useState("");

  const subscribeToAudioAsWell = () => {
    SuperSdk.eventListener((state) => {
      console.log("My state", state[subUid]);
      if (state[subUid].enabled.userAudio && !playing) {
        playing = true;
        const track = state[subUid].mediaTracks.userAudio;
        console.log("track", track);
        const mediaStream = new MediaStream([track]);
        const audio = new Audio();
        audio.autoplay = true;
        audio.srcObject = mediaStream;
      }
    });
  };

  return (
    <div className="App">
      <button
        onClick={() => {
          init();
        }}
      >
        Init
      </button>
      <button
        onClick={() => {
          destroy();
        }}
      >
        Destroy
      </button>
      <input
        type="text"
        placeholder="Uid to subscribe to"
        onChange={(e) => {
          setSubUid(e.target.value);
        }}
      ></input>
      <button
        onClick={() => {
          console.log("Starting Subscribe");
          subscribeToAudioAsWell();
          SuperSdk.subscribe(subUid, "userAudio");
        }}
      >
        Subscribe
      </button>
      <button
        onClick={() => {
          console.log("mystate", SuperSdk.ConsumerInfoMap);
        }}
      >
        Print
      </button>
    </div>
  );
}

export default App;
