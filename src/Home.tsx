import React, { useState } from 'react';
import { addDoc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";
import { useNavigate } from 'react-router';



function Home(props) {
    const navigate = useNavigate()
const [uname, setuname] = useState("")
function validate(){
    let cond:boolean = uname.length>6
    if (!cond){
        alert("Username does not qualify!")
    }
    return cond
}
const clickHandler = async ()=>{
    if(validate()){
     
        
    }
}

    return (
        <div>
            <h2>Home</h2>
            <p>Enter username:</p>
           <input onChange={e=>setuname(e.target.value)} ></input>
            <button onClick={clickHandler}></button>
        </div>
    );
}

export default Home;