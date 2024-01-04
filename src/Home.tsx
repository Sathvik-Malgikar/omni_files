import React, { useEffect, useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";
import { useNavigate } from "react-router";
import { Init, peerOffer } from "./webRTC.ts";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./orbs.css";

function Home() {
  useEffect(() => {
    Init();
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
      let offer = await peerOffer(offer_SDPFirebase);
      await setDoc(docRef, {});

      navigate("/Search", { state: { myUsername: uname } });
    }
  };

  const handleEnter: any = (ev: KeyboardEvent) => {
    if (ev.key == "Enter") {
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
    <div  className="d-flex flex-column align-items-center"  >
    <p className="subtext" >Enter username:</p>
    <Form.Label column sm="4" >  <Form.Control  onChange={(e) => setuname(e.target.value)}></Form.Control></Form.Label>
      
       <div> <Button onClick={clickHandler}>Enter</Button></div>
    </div>
      </div>

     
    </>
  );
}

export default Home;
