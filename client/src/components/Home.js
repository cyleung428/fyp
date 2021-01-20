import React, { useState, useEffect } from "react";
import ElectionContract from "../contracts/Election.json";
import getWeb3 from "../getWeb3";

function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [electionInstance, setElectionInstance] = useState(null);
  useEffect(() => {
    try {
      config();
      if (!window.location.hash) {
        window.location = window.location + '#loaded';
        window.location.reload();
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }, [])

  const config = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = ElectionContract.networks[networkId];
    const electionInstance = new web3.eth.Contract(
      ElectionContract.abi,
      deployedNetwork && deployedNetwork.address,
    );
    setWeb3(web3);
    setAccount(accounts[0]);
    setElectionInstance(electionInstance);
    const admin = electionInstance.methods.getAdmin().call();
    if (accounts[0] === admin) {
      setIsAdmin(true);
    }
  }

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div>
      Home
    </div>
  );
}

export default Home;
