import React from 'react'
import styled from 'styled-components'

const WRAPPER = styled.div`
  height: 550px;
  width: 100%;
  bottom: 0;
  font-family: Montserrat !important;
  display: flex;
  background-color: ${({ theme }) => theme.bg9};
  border-radius: 20px 20px 0 0;
  position: fixed;
  display: flex;
  justify-content: center;
`

const CircularDiv = styled.div`
  position: absolute;
  bottom: -32%;
  .outer-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    border: 6px solid black;

    background: #262626;
  }
  .inner-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 351px;
    height: 351px;
    border-radius: 50%;
    background: #373636;
  }
  .go-btn {
    width: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    height: 150px;
    font-weight: 600;
    font-size: 25px;
    background: linear-gradient(142.39deg, #c922f7 21.76%, rgba(71, 51, 194, 0) 67.58%);
  }
`

const MenuPopup = () => {
  return (
    <WRAPPER>
      <CircularDiv>
        <div className="outer-bg">
          <div className="inner-bg">
            <div className="go-btn">Go!</div>
          </div>
        </div>
      </CircularDiv>
    </WRAPPER>
  )
}

export default MenuPopup
