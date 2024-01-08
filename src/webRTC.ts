import { Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import write_blob from "capacitor-blob-writer";
const CHUNK_SIZE = 1024 * 64;

let pc: RTCPeerConnection;
let dc: RTCDataChannel;
let recieveNewFile;
// (totalSize , name,party)
let updateProgress;
// (incrsize , name,party)
let markComplete;
// (name,party)
let cleanupAndClose;

export const Init = () => {
  const iceConfiguration = {};
  iceConfiguration["iceServers"] = [
    {
      urls: "stun:stun1.l.google.com:19302",
    },
    {
      urls: "stun:stun3.l.google.com:19302",
    },
    {
      urls: "stun:stun4.l.google.com:19302",
    },
  ];
  pc = new RTCPeerConnection(iceConfiguration);
  dc = pc.createDataChannel("file");
  dc.onmessage = msgHandler;
  dc.onopen = (e) => {
    console.log("channel opened!");
  };
  dc.onclose = cleanupAndClose;

  pc.ondatachannel = (dce) => {
    dc = dce.channel;
    dc.onmessage = msgHandler;
    dc.onopen = (e) => {
      console.log("channel opened!");
    };
    dc.onclose = cleanupAndClose;
  };
};

export const exitRTC = () => {
  dc.close();
  pc.close();
};

export const setrecieveNewFile = (foo) => {
  recieveNewFile = foo;
};
export const setupdateProgress = (foo) => {
  updateProgress = foo;
};
export const setmarkComplete = (foo) => {
  markComplete = foo;
};
export const setcleanupAndClose = (foo) => {
  cleanupAndClose = foo;
};

export const sendNewFile = async (file: File) => {
  if (dc.readyState != "open") {
    console.error("dataChannel not open");
    return -1;
  }
  let buffer = await file.arrayBuffer();
  await dc.send(
    JSON.stringify({
      header: "META",
      payload: {
        fileName: file.name,
        fileSize: buffer.byteLength,
      },
    })
  );

  const send = () => {
    while (buffer.byteLength) {
      if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
        dc.onbufferedamountlow = () => {
          dc.onbufferedamountlow = null;
          send();
        };
        return;
      }
      const chunk = buffer.slice(0, CHUNK_SIZE);
      // console.log(chunk.byteLength)
      updateProgress(chunk.byteLength, file.name, "sender");
      buffer = buffer.slice(CHUNK_SIZE, buffer.byteLength);
      dc.send(chunk);
    }
  };
  send();
  async function chk() {
    if (buffer.byteLength == 0) {
      await dc.send(JSON.stringify({ header: "EOF" }));
      markComplete(file.name, "sender");
    } else {
      setTimeout(chk, 100);
    }
  }
  chk();
};

let tempFile: Array<ArrayBuffer> = [];
let fileName: string;
let fileSize: Number;

export const msgHandler = (msg) => {
  // console.log("mh")
  // console.log(typeof msg.data)
  // console.log(msg.data instanceof ArrayBuffer)
  if (typeof msg.data =="object") {
    tempFile.push(msg.data);
    updateProgress(msg.data.byteLength, fileName, "reciever");
  } else {
    let obj = JSON.parse(msg.data);
    if (obj["header"] == "META") {
      let payload = obj["payload"];
      fileName = payload["fileName"];
      fileSize = payload["fileSize"];
      recieveNewFile(fileSize, fileName);
    } else {
      console.log("EOF recieved");

      if (Capacitor.getPlatform() == "web") {
        let a = document.createElement("a");
        // console.log("pakkket")
        a.href = window.URL.createObjectURL(
          new Blob(tempFile, { type: "application/octet-stream" })
        );
        // console.log("generated URL" + a.href)
        a.download = fileName;
        a.click();
      } else {
        write_blob({
          recursive: true,
          fast_mode: true,
          blob: new Blob(tempFile, { type: "application/octet-stream" }),
          path: "omnifiles/" + fileName,
          directory: Directory.Documents,

          on_fallback: (error) => {
            console.error(error);
          },
        }).then(function () {
          console.log("File written.");
        });
      }

      // console.log("after a dot click");

      markComplete(fileName, "reciever");

      tempFile = [];
      fileName = "";
      fileSize = -1;
    }
  }
};

export const peerAcceptAnswer = async (answer) => {
  await pc.setRemoteDescription(answer);
};

// if this is called react needs to set subscription to corresponding firebase doc, and then call peerAcceptAnswer
export const peerOffer = async (updateOfferSDP) => {
  pc.addEventListener("icecandidate", (event) => {
    // console.log("ice candidate found");

    if (!event.candidate) {
      // console.log("SDP added to firebase");
      // console.log(JSON.stringify(pc.localDescription));
      updateOfferSDP(pc.localDescription);
    }
  });

  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
};

export const peerAnswer = async (offer: string) => {
  await pc.setRemoteDescription(JSON.parse(offer));
  let answer = await pc.createAnswer(JSON.parse(offer));
  await pc.setLocalDescription(answer);
  return JSON.stringify(answer);
};
