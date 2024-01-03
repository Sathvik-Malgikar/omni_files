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
    "header" : "META",
    "payload":{
        fileName : file.name,
        fileSize : buffer.byteLength
    }
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
      updateProgress(chunk.byteLength, file.name, "sender");
      buffer = buffer.slice(CHUNK_SIZE, buffer.byteLength);
      dc.send(chunk);
    }
  };

  function chk() {
    if (buffer.byteLength == 0) {
      markComplete(file.name, "sender");
    } else {
      setTimeout(chk, 100);
    }
  }
  chk();
};

export const peerInit = () => {
  pc = new RTCPeerConnection();
};

let tempFile: Array<ArrayBuffer> = [];
let fileName: string;
let fileSize: Number;

// TODO
export const msgHandler = (msg) => {
  if (msg.data instanceof ArrayBuffer) {
    tempFile.push(msg.data);
    updateProgress(msg.data.byteLength, fileName, "reciever");
  } else {
    let obj = JSON.parse(msg.data);
    if (obj["header"] == "META") {
      let payload = obj["payload"];
      fileName = payload["fileName"];
      fileSize = payload["fileSize"];
    } else {
      let a = document.createElement("a");
      a.href = window.URL.createObjectURL(
        new Blob(tempFile, { type: "application/octet-stream" })
      );
      a.download = fileName;
      a.click();

      markComplete(fileName, "reciever");
        
      tempFile=[]
      fileName="";
      fileSize=-1;

    }
  }
};

export const dataChannelInit = (role: string) => {
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

export const peerAcceptAnswer = async (answer) => {
  await pc.setRemoteDescription(answer);
};

// if this is called react needs to set subscription to corresponding firebase doc, and then call peerAcceptAnswer
export const peerOffer = async () => {
  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  return pc.localDescription;
};

export const peerAnswer = async (offer) => {
  await pc.setRemoteDescription(offer);
  let answer = await pc.createAnswer(offer);
  await pc.setLocalDescription(answer);
  return answer;
};
