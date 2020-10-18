import React from "react";
import "./styles.css";
import Wallet from "./Wallet/Wallet";

export default function App() {
  return (
    <div className="App">
      <div className="header">
        <img className="logo" src="https://uploads.codesandbox.io/uploads/user/90c8d0d8-b495-4f1e-9f89-fe6e04efc17c/cU2P-logo.PNG" alt="logo"/>
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
