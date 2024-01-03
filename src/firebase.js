import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDkhwfGSyNjmpKBrw80LQHKury1uEu1FQk",
    authDomain: "rtcfilesharing.firebaseapp.com",
    projectId: "rtcfilesharing",
    storageBucket: "rtcfilesharing.appspot.com",
    messagingSenderId: "587237242674",
    appId: "1:587237242674:web:47fd160c259843b06dc92b",
    measurementId: "G-RQ9NFSK9PP",
};

let app = initializeApp(firebaseConfig);
export const firestore= getFirestore(app)
