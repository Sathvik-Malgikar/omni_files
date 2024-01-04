import React from 'react';
import BSCard from 'react-bootstrap/Card';

function Card({name,onPress}) {
    return (
        <BSCard onClick={()=>onPress(name)}>
      <BSCard.Body>
          <BSCard.Text>{name}</BSCard.Text>
        </BSCard.Body>
      </BSCard>
    );
}

export default Card;