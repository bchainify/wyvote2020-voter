import React from "react";
import "./styles.css";
import Wallet from "./Wallet/Wallet";
import logo from "./assets/logo.PNG";

export default function App() {
  return (
    <div className="App">
      <div className="header">
        <img className="logo" src={logo} alt="logo"/>
      </div>
      <Wallet />

      <div className="footer">
        <p>
          <h1>WYVote 2020</h1>
          Contact: help@bchainify.com <br /> Phone: (+1)0000 000000
        </p>
      </div>
    </div>
  );
}
