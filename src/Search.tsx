import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { peerAcceptAnswer, peerAnswer } from "./webRTC.ts";
import { useLocation, useNavigate } from "react-router";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import "./orbs.css";

import Card from "./Card.tsx";
function Search() {


  const [recieveCandidates, setrecieveCandidates] = useState<Array<string>>([]);

  const [sval, setsval] = useState("");
  const state = useLocation().state;
  const navigate = useNavigate();
  
  let myUsername;

  if (state!=null){

    myUsername = state.myUsername
  }else{
    myUsername = "";
    
  }



 

  const answerHandler = async (offererName: string) => {
    //  console.log(offererName)
    const docRef = doc(firestore, "offers", offererName);
    let data = (await getDoc(docRef)).data()!;
    // console.log(data["offerSDP"]);
    let answerSDP = await peerAnswer(data["offerSDP"]);
    updateDoc(docRef, { answerSDP: answerSDP, answererName: myUsername });
    let sub = onSnapshot(docRef, {
      next: (snap) => {
        if (!snap.exists()) {
          sub();
          deleteDoc(doc(firestore, "offers", myUsername));
          navigate("/Share", { state: { partnerName: offererName } });
        }
      },
    });
  };
  const search = async () => {
    let ts: Set<string> = new Set();

    // console.log("search for " + sval);

    let colRef = await collection(firestore, "offers");
    let q = await query(
      colRef,
      where("offerer", ">=", sval),
      where("offerer", "<", sval + "z"),
      limit(5)
    );
    let qs = await getDocs(q);
    let ar = await qs.docs;
    ar.map(async (ele) => {
      let d = await ele.data();
      // console.log(d["offerer"]);
      if (d["offerer"] == myUsername) {
        return;
      }
      ts.add(d["offerer"]);
    });

    return ts;
  };
  useEffect(() => {
    let timeout = setTimeout(async () => {
      let res: Set<string> = await search();
      setrecieveCandidates(Array.from(res));
    }, 160);

    return () => {
      clearTimeout(timeout);
    };
  }, [sval]);

  useEffect(() => {
    //null state check
    if(myUsername==""){
      navigate("/")
      return
    }

    const docRef = doc(firestore, "offers", myUsername);
    // console.log("props recieved");
    // console.log(myUsername);

    let unsubscribe = onSnapshot(docRef, {
      next: async (snap) => {
        if (!snap.exists()) {
          return;
        }
        let newData = await snap.data();
        if (newData && newData["answerSDP"]) {
          await peerAcceptAnswer(JSON.parse(newData["answerSDP"]));
          deleteDoc(docRef);
          navigate("/Share", {
            state: { partnerName: newData["answererName"] },
          });
        }
      },
    });
    return unsubscribe;
  }, []);

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
      <div className="context searchalign d-flex align-items-center justify-content-center">
        <div className="container-md">
          <Stack direction="vertical" gap={4}>
            <Form.Control
              value={sval}
              onChange={(eve) => setsval(eve.target.value)}
              className="me-auto"
              placeholder="Search peers by username ..."
            />
            <h3>Available peers:</h3>
            <div>
              {recieveCandidates.map((name) => (
                <Card onPress={answerHandler} key={name} name={name}></Card>
              ))}
            </div>
            <Button
              onClick={() => {
                setsval("");
              }}
            >
              Clear
            </Button>
          </Stack>
        </div>
      </div>
    </>
  );
}

export default Search;
