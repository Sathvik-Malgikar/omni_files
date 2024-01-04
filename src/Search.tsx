import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import {
  addDoc,
  collection,
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
import { peerAcceptAnswer } from "./webRTC.ts";
import { useLocation } from "react-router";
import Card from "./Card.tsx"
function Search() {
  const [recieveCandidates, setrecieveCandidates] = useState<Array<string>>([]);
  
  const [sval, setsval] = useState("");
  const { offerer } = useLocation().state;
  const answerSubscribe = async () => {
    const docRef = await doc(firestore, "offers", offerer);
    onSnapshot(docRef, {
      next: async (snap) => {
        if (!snap.exists()) {
          return;
        }
        let newData = await snap.data();
        if (newData && newData["answerSDP"]) {
          await peerAcceptAnswer(JSON.parse(newData["answerSDP"]));
        }
      },
    });
  };
  const search = async () => {
    
      let ts:Set<string> = new Set();

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
  
        ts.add(d["offerer"])
      });
      return ts;
  

  };
  useEffect(() => {
    
    let timeout = setTimeout(async ()=>{
        let res :Set<string>= await search()
        setrecieveCandidates(Array.from(res))

    },160)

    return ()=>{
        clearTimeout(timeout)
    }

  }, [sval]);

  useEffect(() => {
    console.log("props recieved");
    console.log(offerer);
    answerSubscribe();
  }, []);

  return (
    <div>
      <p>Search peers</p>
      <input onChange={(eve) => setsval(eve.target.value)}></input>
      {recieveCandidates.map(name=><Card key={name} name={name} ></Card>)}
      <a href="/Share">Share</a>
    </div>
  );
}

export default Search;
