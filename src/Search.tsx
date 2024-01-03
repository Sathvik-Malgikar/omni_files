import React from 'react';
import { addDoc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";



function Search(props) {
    return (
        <div>
                <p>Search</p>
            <a href='/Share'>Share</a>
        </div>
    );
}

export default Search;