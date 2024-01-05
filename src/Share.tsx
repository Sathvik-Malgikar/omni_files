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
import Button from "react-bootstrap/Button";
import { Form, Stack } from "react-bootstrap";
import "./orbs.css";

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
      <div className="context sharealign white">
    
    <Stack gap={4}>

<div className="d-flex justify-content-evenly" >
        <h3>You are now connected to {partnerName}!</h3>
<Button variant="danger" onClick={cleanupAndClose} >Leave and destroy room</Button>
</div>
        <Form.Control onChange={selectHandler} type="file"></Form.Control>
        <Button onClick={sendHandler}>SEND</Button>
        <div className="d-flex align-items-center justify-content-evenly">
          <div className="d-flex flex-column" >  <p>Recieved files:</p>
        
          {Object.entries(recFiles).map(([a, b]) => (
            <ProgressBar variant="success" animated label={a} key={a} now={b}></ProgressBar>
          ))}
        
          </div>
          <div className="d-flex flex-row"> <p>Sent files:</p>
        
          {Object.entries(sendFiles).map(([a, b]) => (
            <ProgressBar variant="success" animated label={a} key={a} now={b}></ProgressBar>
          ))}
        
          </div>
        </div>
    </Stack>

      
       
      </div>
    </>
  );
}

export default Share;
