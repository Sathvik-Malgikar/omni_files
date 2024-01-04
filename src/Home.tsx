import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { useNavigate } from "react-router";
import { Init, peerAcceptAnswer, peerOffer } from "./webRTC.ts";

function Home(props) {
  useEffect(() => {
    Init();
  }, []);

  const navigate = useNavigate();
  const [uname, setuname] = useState("");
  function validate() {
    let cond: boolean = uname.length > 6;
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

    navigate("/Search", {"state" : {"offerer":uname}})
    }
  };

  return (
    <div>
      <h2>Home</h2>
      <p>Enter username:</p>
      <input onChange={(e) => setuname(e.target.value)}></input>
      <button onClick={clickHandler}></button>
    </div>
  );
}

export default Home;
