import React, { ChangeEvent, useEffect, useState } from "react";
import {
  channelReady,
  exitRTC,
  sendNewFile,
  setmarkComplete,
  setrecieveNewFile,
  setupdateProgress,
} from "./webRTC.ts";
import { useLocation, useNavigate } from "react-router";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";
import { Form, Stack } from "react-bootstrap";
import "./orbs.css";

function Share() {
  const state = useLocation().state;
  const navigate = useNavigate();
  let partnerName;
  if (state != null) {
    partnerName = state.partnerName;
  } else {
    partnerName = "";
  }
  const [recFiles, setrecFiles] = useState<Object>({});
  const [sendFiles, setsendFiles] = useState<Object>({});
  const [fileSizes, setfileSizes] = useState<Object>({});

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
    // console.log("mc");
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
          [fileName]: prev[fileName] + (incrSize * 100) / fileSizes[fileName],
        };
      });
    } else {
      setsendFiles((prev) => {
        return {
          ...prev,
          [fileName]: prev[fileName] + (incrSize * 100) / fileSizes[fileName],
        };
      });
    }
  };

  useEffect(() => {
    // null state check
    if (partnerName == "") {
      navigate("/");
      return;
    }
    let tmt;
    const checkChannel = () => {
      if (channelReady) {
        setfileSizes((prev) => {
          return { channelSet: true }; //this is dummy re render
        });
      } else {
        tmt = setTimeout(checkChannel, 250);
      }
    };
    checkChannel();
    setrecieveNewFile(receiveNewFile);
    setmarkComplete(markComplete);
    setupdateProgress(updateProgress);

    // setcleanupAndClose(cleanupAndClose);

    return () => {
      clearTimeout(tmt);
      setrecieveNewFile(null);
      setmarkComplete(null);
      setupdateProgress(null);

      // setcleanupAndClose(null);
      // cleanupAndClose()
      // exitRTC()
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
    <>
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      {false ? (
        <div className="context sharealign white">
          <Stack gap={4}>
            <div className="d-flex justify-content-evenly">
              <h3>You are now connected to {partnerName}!</h3>
              <Button variant="danger" onClick={exitRTC}>
                Leave and destroy room
              </Button>
            </div>
            <Form.Control onChange={selectHandler} type="file"></Form.Control>
            <Button onClick={sendHandler}>SEND</Button>
            <div className="d-flex align-items-center justify-content-evenly">
              <Stack gap={4} className="d-flex flex-column">
                {" "}
                <p>Recieved files:</p>
                {Object.entries(recFiles).map(([a, b]) => (
                  <ProgressBar
                    variant="success"
                    animated
                    label={a}
                    key={a}
                    now={b}
                  ></ProgressBar>
                ))}
              </Stack>
              <Stack gap={4} className="d-flex flex-column">
                {" "}
                <p>Sent files:</p>
                {Object.entries(sendFiles).map(([a, b]) => (
                  <ProgressBar
                    variant="success"
                    animated
                    label={a}
                    key={a}
                    now={b}
                  ></ProgressBar>
                ))}
              </Stack>
            </div>
          </Stack>
        </div>
      ) : (<div className="d-flex justify-content-center align-items-center context" >

        <span className="loader"></span>
      </div>
      )}
    </>
  );
}

export default Share;
