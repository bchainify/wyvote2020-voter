import React from "react";
import "./styles.css";
import Wallet from "./Wallet/Wallet";

export default function App() {
  return (
    <div className="App">
      <div className="header">
        <img className="logo" src="https://github.com/bchainify/wyvote2020-voter/blob/main/src/assets/favicon.png?raw=true" alt="logo"/>
      </div>
      <Wallet />

      <div className="footer">
        <a href="https://bchainify.github.io/wyvote2020-voter/" target="_blank" rel="noopener noreferrer">
          <h3>
            Instructions to use
          </h3>
        </a>
        <br />
    <div class="center video-wrap">
          <div class="center video-container">
        <iframe title="instructionVideo" src="https://www.youtube.com/embed/7DbUMnmIFOs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    </div>
        <br />
        <p>
          <h1>WYVote 2020</h1>
          Contact: help@bchainify.com <br /> Phone: (+1)0000 000000
        </p>
      </div>
    </div>
  );
}
