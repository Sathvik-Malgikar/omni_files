import React, { useState } from 'react';
import BSCard from 'react-bootstrap/Card';

function Card({name,onPress}) {
  const [hover, sethover] = useState(false)
    return (
        <BSCard onMouseLeave={()=>{
          sethover(false)
        }} onMouseEnter={()=>{
          sethover(true)
        }} onClick={()=>onPress(name)}>
          <div className='d-flex' >

          <BSCard.Img height={50} variant='left' src={"https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg"} ></BSCard.Img>
      <BSCard.Body>
          <BSCard.Text>{name}</BSCard.Text>
          {hover && <small className="text-muted">Click to Connect</small>}
        </BSCard.Body>
          </div>
      </BSCard>
    );
}

export default Card;