import React from 'react';
import BSCard from 'react-bootstrap/Card';

function Card({name}) {
    return (
        <BSCard>
      <BSCard.Body>
          <BSCard.Text>{name}</BSCard.Text>
        </BSCard.Body>
      </BSCard>
    );
}

export default Card;