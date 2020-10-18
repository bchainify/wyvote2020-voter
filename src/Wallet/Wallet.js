import React from "react";
import * as libsimba from "@simbachain/libsimba-js";

class Wallet extends React.Component {
  constructor() {
    super();
    this.state = {
      address: "loading...",
      mnemonic: "",
      wallet: new libsimba.LocalWallet(() => {
        //Ask the user for permission before signing
        console.log("Ask the user for permission before signing");
        return Promise.resolve(
          window.confirm("Do you want to sign this transaction?")
        );
      }),
      simba: null
    };
    this.vote = {
      "": -1
    };
    this.UnlockWallet = this.UnlockWallet.bind(this);
    this.GenerateWallet = this.GenerateWallet.bind(this);
    this.ConnectSimba = this.ConnectSimba.bind(this);
    this.reloadBalance = this.reloadBalance.bind(this);
    this.Vote = this.Vote.bind(this);
  }

  async GenerateWallet() {
    document.getElementById("progress").innerHTML = "Generating Wallet...";

    document.getElementById("wallet").style.display = "none";
    //Use this to prevent progress output spam
    let lastProgress = 0;

    await this.state.wallet.generateWallet(
      document.getElementById("passkey-gen").value,
      (progress) => {
        if (Math.floor(progress * 10) > lastProgress) {
          lastProgress = progress * 10;
          document.getElementById("wallet-address").innerHTML =
            "Encrypting Wallet: " + Math.floor(progress * 100) + "%";
        }
      }
    );

    this.state.address = await this.state.wallet.getAddress();
    document.getElementById("wallet-address").innerHTML =
      "ETH Address: " + this.state.address;
    document.getElementById("wallet").style.display = "none";

    document.getElementById("connect-simba").style.display = "block";
    document.getElementById("reload-ready-button").style.display = "none";
    document.getElementById("faucet").style.display = "none";

    document.getElementById("progress").innerHTML = "";
  }
  async UnlockWallet() {
    document.getElementById("progress").innerHTML = "Unlocking Wallet...";

    //Use this to prevent progress output spam
    let lastProgress = 0;

    await this.state.wallet.generateWalletFromMnemonic(
      document.getElementById("address-unlock").value,
      "VoterWallet",
      (progress) => {
        if (Math.floor(progress * 10) > lastProgress) {
          lastProgress = progress * 10;
          document.getElementById("wallet-address").innerHTML =
            "Decrypting Wallet: " + Math.floor(progress * 100) + "%";
        }
      }
    );
    this.state.address = await this.state.wallet.getAddress();
    this.state.mnemonic = await this.state.wallet.getMnemonic();
    document.getElementById("wallet-address").innerHTML =
      "ETH Address: " + this.state.address;

    document.getElementById("wallet").style.display = "none";
    document.getElementById("connect-simba").style.display = "block";
    document.getElementById("reload-ready-button").style.display = "none";
    document.getElementById("faucet").style.display = "none";

    document.getElementById("progress").innerHTML = "";
  }

  async ConnectSimba() {
    document.getElementById("wallet").style.display = "none";
    document.getElementById("funds").innerHTML = "Initialising Simba";
    this.state.simba = await libsimba.getSimbaInstance(
      "https://api.simbachain.com/v1/election2020/",
      this.state.wallet,
      "3998d4f3a8ed18dc4a51f7571d8615e027046a1874c94061320ce981a0efe618"
    );
    let balance = await this.state.simba.getBalance();
    document.getElementById("balance").innerHTML =
      "Balance: " +
      JSON.stringify(parseInt(balance.amount) / 1000000000000000000) +
      " Ethers";
    let result = await this.state.simba.addFunds();
    if (result.poa) {
      document.getElementById("funds").innerHTML =
        "Didn't add funds? PoA network. " + JSON.stringify(result);
    } else if (result.faucet_url) {
      document.getElementById("funds").innerHTML =
        "Didn't add funds? Use External faucet. <br/> To top up, you need to ask the user to visit the url in: ";
      document.getElementById("faucet").style.display = "block";
    } else {
      document.getElementById("funds").innerHTML =
        "Didn't add funds? Use External faucet. <br/> To top up, you need to ask the user to visit the url in:";
      document.getElementById("faucet").href = result.faucet_url;
      document.getElementById("faucet").style.display = "block";
    }
    document.getElementById("reload-ready-button").style.display = "block";
  }
  async reloadBalance() {
    let balance = await this.state.simba.getBalance();
    document.getElementById("balance").innerHTML =
      "Balance: " +
      JSON.stringify(parseInt(balance.amount) / 1000000000000000000) +
      " Ethers";
  }

  readyToVote() {
    document.getElementById("connect-simba").style.display = "none";
    document.getElementById("vote-div").style.display = "block";
  }

  changeWallet() {
    document.getElementById("connect-simba").style.display = "none";
    document.getElementById("wallet").style.display = "block";
  }
  async Vote() {
    document.getElementById("connect-simba").style.display = "none";
    document.getElementById("vote-div").style.display = "none";
    var ele = document.getElementsByName("vote");

    for (var i = 0; i < ele.length; i++) {
      if (ele[i].checked) {
        document.getElementById("vote-status").innerHTML =
          "Candidate Selected: " + ele[i].value;

        this.vote[""] = parseInt(ele[i].value);
      }
    }
    console.log(this.vote);

    await this.state.simba
      .callMethod("candidates", this.vote)
      .then(async (ret) => {
        document.getElementById("wallet-address").innerHTML =
          "Thank you for voting!";

        console.log(`Successful!  ${JSON.stringify(ret)}`);
        //The request and signing were successful, now we wait for the API to
        // tell us if the txn was successful or not.
        const { future, cancel } = this.state.simba.waitForSuccessOrError(ret);
        //`future` is a JS Promise that will resolve when we know the status
        //`cancel` is a function, you can call it to cancel the above request if needed
        return await future
          .then((txn) => {
            //txn will hold the txn details
            //txn.status will hold the status
          console.log(cancel);
            document.getElementById("vote-status").innerHTML =
              "Vote Confirmed. <br/> Status:" +  txn.status;
            if (txn.status === "DEPLOYED") {
              document.getElementById("vote-hash").innerHTML =
                "Hash:" + txn.transaction_hash;
            }
          })
          .catch((error) => {
            document.getElementById("vote-hash").innerHTML =
              "Vote failed to deploy! Please contact us at help@bchainify.com <br/>" +
              JSON.stringify(error);
          });
      })
      .catch((error) => {
        document.getElementById("vote-hash").innerHTML =
          "Vote failed to deploy! <br/>" + JSON.stringify(error);
      });
  }

  async Transactions() {}

  render() {
    return (
      <div>
        <div id="wallet">
          <h2 className="info">Log in using your Wallet</h2>
          <div id="unlock-wallet">
            <div className="input-field">
              <input
                type="text"
                className="input-button"
                id="address-unlock"
                placeholder="Mnemonic"
              />
            </div>
            
            <button
              className=" submit-button input-field input-button"
              id="unlock-button"
              onClick={this.UnlockWallet}
            >
              Unlock your Wallet
            </button>
          </div>

          <h2 className="info">
            or <br /> <br /> Generate a new Wallet
          </h2>

          <div id="generate-wallet">
            <div className="input-field">
              <input
                type="password"
                className="input-button"
                id="passkey-gen"
                placeholder="Password"
              />
            </div>
            <button
              className="submit-button input-field input-button"
              id="generate-button"
              onClick={this.GenerateWallet}
            >
              Generate a new Wallet
            </button>
          </div>
        </div>
        <p id="progress"></p>
        <p id="wallet-address"></p>

        <div id="connect-simba">
          <div>
            <button
              className="input-button submit-button input-field"
              id="connect-button"
              onClick={this.ConnectSimba}
            >
              Go Ahead
            </button>
            <button
              className="input-button submit-button input-field"
              id="connect-button"
              onClick={this.changeWallet}
            >
              Change Wallet
            </button>
          </div>
          <div>
            <p id="balance"></p>
            <p id="funds"></p>
            <a id="faucet" href="https://faucet.rinkeby.io" target="_blank">
              Faucet
            </a>
          </div>
          <div id="reload-ready-button">
            <button
              className="input-button submit-button input-field"
              onClick={this.reloadBalance}
            >
              Reload balance
            </button>
            <button
              className="input-button submit-button input-field"
              onClick={this.readyToVote}
            >
              Ready to Vote!
            </button>
          </div>
        </div>

        <div id="vote-div">
          <form>
            <h2>Vote here:</h2>
            <div className="candidate-radio">
              <input type="radio" className="Candidate" id="Candidate1" name="vote" value="1" />
              Republican - Trump & Pence
            </div>
            <div>
              <input type="radio" className="Candidate" id="Candidate2" name="vote" value="2" />
              Democratic - Biden & Harris
            </div>
            <div>
              <input type="radio" className="Candidate" id="Candidate1" name="vote" value="3" />
              Libertarian - Jorgensen & Cohen
            </div>
            <div>
              <input type="radio" className="Candidate" id="Candidate1" name="vote" value="4" />
              Independent - Pierce & Ballard
            </div>
            <div>
              <input type="radio" className="Candidate" id="Candidate1" name="vote" value="5" />
              Write-In
            </div>
          </form>
          <button
            className="input-button submit-button input-field"
            onClick={this.Vote}
          >
            Vote
          </button>
        </div>
        <p id="vote-status"></p>
        <p id="vote-hash"></p>
      </div>
    );
  }
}

export default Wallet;
