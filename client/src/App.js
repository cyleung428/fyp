import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import { NavBar } from './components/Nav';
import ElectionContract from "./contracts/Election.json";
import getWeb3 from "./getWeb3";
import { mergeStyles } from '@fluentui/react';

const appStyles = mergeStyles({
    display: "flex",
    width: "100%"
})
const navStyles = mergeStyles({
    width: "324px"
})
const bodyStyles = mergeStyles({
    display: "flex",
    width: "calc(100% - 324px)"
})

export default function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [admin, setAdmin] = useState("");
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [electionInstance, setElectionInstance] = useState(null);

    useEffect(() => {
        if (admin === account || admin.toLocaleLowerCase() === account.toLocaleLowerCase()) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [admin, account])

    useEffect(() => {
        try {
            config();
            window.ethereum.on('accountsChanged', function (accounts) {
                // Time to reload your interface with accounts[0]!
                setAccount(accounts[0]);
            })

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
        const admin = await electionInstance.methods.getAdmin().call();
        setAdmin(admin);
    }

    if (!web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
        <div className={appStyles}>
            <div className={navStyles}>
                <NavBar />
            </div>
            <div className={bodyStyles}>
                <Router>
                    <Switch>
                        <Route path="/">
                            <Home />
                        </Route>
                    </Switch>
                </Router>
            </div>
        </div>
    )
}
