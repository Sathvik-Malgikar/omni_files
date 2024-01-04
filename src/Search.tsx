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
  const search = async (eve: ChangeEvent<HTMLInputElement>) => {
    setrecieveCandidates([]);
    let val = eve.target.value;
    console.log("search for " + val);
    eve.preventDefault();
    setsval(val);

    let colRef = await collection(firestore, "offers");
    let q = await query(
      colRef,
      where("offerer", ">=", val),
      where("offerer", "<", val + "z"),
      limit(5)
    );
    getDocs(q).then(async (qs) => {
      let ar = await qs.docs;
      ar.forEach(async (ele) => {
        let d = await ele.data();
        console.log(d["offerer"]);

        if (recieveCandidates.includes(d["offerer"])) {
            return;
        }
        setrecieveCandidates((preVal) => [...preVal, d["offerer"]]);
      });
    });
  };
  useEffect(() => {
    console.log("props recieved");
    console.log(offerer);
    answerSubscribe();
  }, []);

  return (
    <div>
      <p>Search peers</p>
      <input onChange={search}></input>
{recieveCandidates}
      <a href="/Share">Share</a>
    </div>
  );
}

export default Search;
