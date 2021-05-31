import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";
import ReactDOM from 'react-dom';
import "./App.css";

class App extends Component {
  state = { highestBidder: 0, web3: null, accounts: null, contract: null,input: ""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const response = await instance.methods.highestBidder().call();

      const hb = await instance.methods.highestBid().call();

      const cb = await instance.methods.getContractBalance().call();

      this.setState({ web3, accounts, contract: instance,highestBidder:response,highestBid:hb,contractBalance:cb});
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    const { accounts, contract,web3} = this.state;

    console.log("bid")

    // Stores a given value, 5 by default.
    await contract.methods.bid().send({value: web3.utils.toWei(this.state.input),from: accounts[0]});

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getHighestBidder().call();

    const hb = await contract.methods.getHighestBid().call();

    const cb = await contract.methods.getContractBalance().call();

    // Update state with the result.
    this.setState({ highestBidder: response,highestBid: hb,contractBalance: cb});
  };

  withdraw= async () => {
    const { accounts, contract } = this.state;

    console.log(this.state.input)

    // Stores a given value, 5 by default.
    const check = await contract.methods.getHighestBidder().call();

    if(check === accounts[0]){
      let element = document.getElementById('wbutton')
      ReactDOM.findDOMNode(element).style.backgroundColor = 'red'
    }

    await contract.methods.withdraw().send({from: accounts[0]});

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getHighestBidder().call();

    const hb = await contract.methods.getHighestBid().call();

    const cb = await contract.methods.getContractBalance().call();

    // Update state with the result.
    this.setState({ highestBidder: response,highestBid: hb,contractBalance: cb});
  };

  myChangeHandler = (event) => {
    this.setState({input: event.target.value},() => {console.log(this.state.input)});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Auction</h1>
        <p>Place your bid inside the text</p>
        <div>The highestBidders address is: {this.state.highestBidder}</div>
        <div>The highestBid is: {this.state.highestBid}</div>
        <div>The contract Balance is: {this.state.contractBalance}</div>
        <input type="text" onChange = {this.myChangeHandler}/>
        <button onClick={this.bid}>Bid</button>
        <br></br>
        <br></br>
        <button onClick={this.withdraw} id='wbutton'>Withdraw your bid </button>

      </div>
    );
  }
}

export default App;
