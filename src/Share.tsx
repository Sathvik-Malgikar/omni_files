import React, { useEffect, useState } from 'react';
import { setcleanupAndClose, setmarkComplete, setrecieveNewFile, setupdateProgress } from './webRTC.ts';
import { useLocation } from 'react-router';



function Share(props) {
    const {partnerName} = useLocation().state

    return (
        <div>
            <h3>You are now connected to{partnerName}!</h3>
            <p>Share</p>
            <input type='file'></input>
            <p>Recieved files:</p>
            <div></div>
            <p>Sent files:</p>
            <div></div>
        </div>
    );
}

export default Share;