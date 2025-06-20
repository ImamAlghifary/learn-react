import React from "react";
import styled from 'styled-components';

const Button = styled.button`
    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
    background: palevioletred;
    color: white
`

const ButtonStyled = () =>{
    return <Button>SampleButton</Button>
}

export default ButtonStyled;