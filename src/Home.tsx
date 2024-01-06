import React, { useEffect, useState } from "react";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";
import { useLocation, useNavigate } from "react-router";
import { Init, peerOffer, setcleanupAndClose } from "./webRTC.ts";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./orbs.css";

function Home() {
  const cleanupAndClose = () => {
    alert("Connection lost \n Redirecting to HOME.");
    setTimeout(() => {
      navigate("/");
    }, 600);
  };

  useEffect(() => {
    setcleanupAndClose(cleanupAndClose);

    Init();
    return () => {
      setcleanupAndClose(null);
    };
  }, []);


  const navigate = useNavigate();
  const [uname, setuname] = useState("");
  function validate() {
    let cond: boolean = uname.length > 3;
    if (!cond) {
      alert("Username does not qualify!");
    }
    return cond;
  }
  const clickHandler = async () => {
    if (validate()) {
      function offer_SDPFirebase(sdp) {
        updateDoc(docRef, {
          offerer: uname,
          offerSDP: JSON.stringify(sdp),
        });
      }
      const docRef = await doc(firestore, "offers", uname);
      await peerOffer(offer_SDPFirebase);
      await setDoc(docRef, {});
      window.onbeforeunload = async ()=>{
        await deleteDoc(docRef);
      }
      navigate("/Search", { state: { myUsername: uname } });
    }
  };

  const handleEnter: any = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      clickHandler();
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
      <div className="context" onKeyDown={handleEnter}>
        <h1>Omni-Files. P2P File sharing hassle free</h1>
        <div className="d-flex flex-column align-items-center">
          <p className="subtext">Enter username:</p>
          <Form.Label column sm="4">
            {" "}
            <Form.Control
              onChange={(e) => setuname(e.target.value)}
            ></Form.Control>
          </Form.Label>

          <div>
            {" "}
            <Button onClick={clickHandler}>Enter</Button>
          </div>
          <br></br>
          <br></br>
          <a className="white"  href="https://dl.dropbox.com/scl/fi/9aj8v2gdkpme9859oyoe8/app-debug.apk?rlkey=oh1f58xv83khk366ptieu5iic&dl=0" ><h4>Get the android app HERE!</h4></a>
        </div>
      </div>
    </>
  );
}

export default Home;
