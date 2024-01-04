import React, { ChangeEvent, useEffect, useState } from "react";
import {
  sendNewFile,
  setcleanupAndClose,
  setmarkComplete,
  setrecieveNewFile,
  setupdateProgress,
} from "./webRTC.ts";
import { useLocation, useNavigate } from "react-router";
import ProgressBar from "react-bootstrap/ProgressBar";

function Share(props) {
  const { partnerName } = useLocation().state;
  const [recFiles, setrecFiles] = useState<Object>({});
  const [sendFiles, setsendFiles] = useState<Object>({});
  const [fileSizes, setfileSizes] = useState<Object>({});

  const navigate = useNavigate();
  const receiveNewFile = (totalSize, fileName: string) => {
    // console.log("rnf");
    // console.log(totalSize)
    setrecFiles((prev) => {
      return { ...prev, [fileName]: 0 };
    });

    setfileSizes((prev) => {
      return { ...prev, [fileName]: totalSize };
    });
  };
  const markComplete = (fileName, party) => {
    console.log("mc");
    if (party == "reciever") {
      setrecFiles((prev) => {
        return { ...prev, [fileName]: 100 };
      });
    } else {
      setsendFiles((prev) => {
        return { ...prev, [fileName]: 100 };
      });
    }
  };
  const cleanupAndClose = () => {
    alert("Connection lost \n Redirecting to HOME.");
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };
  const updateProgress = (
    incrSize: number,
    fileName: string,
    party: string
  ) => {
    // console.log("up");
    // console.log(incrSize)

    if (party == "reciever") {
      setrecFiles((prev) => {
        // console.log("before vv")
        // console.log(prev[fileName] + (incrSize / fileSizes[fileName]))
        return {
          ...prev,
          [fileName]: prev[fileName] + (incrSize*100 / fileSizes[fileName]),
        };
      });
    } else {
      setsendFiles((prev) => {
        return {
          ...prev,
          [fileName]: prev[fileName] + incrSize*100 / fileSizes[fileName],
        };
      });
    }
  };
  useEffect(() => {
    setrecieveNewFile(receiveNewFile);
    setmarkComplete(markComplete);
    setupdateProgress(updateProgress);
    setcleanupAndClose(cleanupAndClose);

    return () => {
      setrecieveNewFile(null);
      setmarkComplete(null);
      setupdateProgress(null);
      setcleanupAndClose(null);
    };
  }, []);
  const [pickedFile, setpickedFile] = useState<File | null>(null);
  const selectHandler = (eve: ChangeEvent<HTMLInputElement>) => {
    let temp = eve.target.files!;
    setpickedFile(temp[0]);
  };
  const sendHandler = async () => {
    if (pickedFile == null) {
      alert("pick a file");
    } else {
      setsendFiles((prev) => {
        return { ...prev, [pickedFile.name]: 0 };
      });

      setfileSizes((prev) => {
        return { ...prev, [pickedFile.name]: pickedFile.size };
      });

      sendNewFile(pickedFile!).then((v) => {
        if (v == -1) {
          alert("SEND FAILED");
        }
      });
    }
  };

  return (
    <div>
      <h3>You are now connected to{partnerName}!</h3>
      <p>Share</p>
      <input onChange={selectHandler} type="file"></input>
      <button onClick={sendHandler}>SEND</button>
      <p>Recieved files:</p>
      <div>
        {Object.entries(recFiles).map(([a, b]) => (
          <ProgressBar animated label={a} key={a} now={b}></ProgressBar>
        ))}
      </div>
      <p>Sent files:</p>
      <div>
        {Object.entries(sendFiles).map(([a, b]) => (
          <ProgressBar animated label={a} key={a} now={b}></ProgressBar>
        ))}
      </div>
    </div>
  );
}

export default Share;
