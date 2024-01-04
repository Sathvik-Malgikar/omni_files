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

import Card from "./Card.tsx";
function Search() {
  const [recieveCandidates, setrecieveCandidates] = useState<Array<string>>([]);

  const [sval, setsval] = useState("");
  const { myUsername } = useLocation().state;
  const navigate = useNavigate();

  const answerHandler = async (offererName: string) => {
    //  console.log(offererName)
    const docRef = doc(firestore, "offers", offererName);
    let data = (await getDoc(docRef)).data()!;
    console.log(data["offerSDP"]);
    let answerSDP = await peerAnswer(data["offerSDP"]);
    updateDoc(docRef, { answerSDP: answerSDP, answererName: myUsername });
    let sub = onSnapshot(docRef,{next : (snap)=>{

        if(!snap.exists()){
            sub()
            navigate("/Share",{state : {"partnerName" : offererName}})

        }

    }})
  };
  const search = async () => {
    let ts: Set<string> = new Set();

    console.log("search for " + sval);

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
      console.log(d["offerer"]);
      if (d["offerer"] == myUsername){
        return
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
    const docRef = doc(firestore, "offers", myUsername);
    console.log("props recieved");
    console.log(myUsername);

    let unsubscribe = onSnapshot(docRef, {
      next: async (snap) => {
        if (!snap.exists()) {
          return;
        }
        let newData = await snap.data();
        if (newData && newData["answerSDP"]) {
          await peerAcceptAnswer(JSON.parse(newData["answerSDP"]));
          deleteDoc(docRef)
          navigate("/Share",{state : {"partnerName" : newData["answererName"]}})
        }
      },
    });
    return unsubscribe;
  }, []);

  return (
    <div>
      <p>Search peers</p>
      <input onChange={(eve) => setsval(eve.target.value)}></input>
      {recieveCandidates.map((name) => (
        <Card onPress={answerHandler} key={name} name={name}></Card>
      ))}
      <a href="/Share">Share</a>
    </div>
  );
}

export default Search;
