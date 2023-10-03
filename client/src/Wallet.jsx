import React, { useState, useEffect } from "react";
import server from "./server";

function Wallet({ setWallet, balance, setBalance }) {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    async function fetchWallets() {
      try {
        const response = await server.get("wallets");
        const { data } = response;
        setWallets(data);
      } catch (error) {
        console.error("Error fetching wallets:", error);
        // Handle the error gracefully, e.g., display a message to the user
      }
    }
    fetchWallets();
  }, []);

  async function onChange(evt) {
    const w = wallets[evt.target.value];
    if (w) {
      setWallet(w);
      const {
        data: { balance },
      } = await server.get(`balance/${w.address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <select onChange={onChange}>
          <option value="-1">Select an address</option>
          {wallets.map((wallet, i) => (
            <option key={i} value={i}>
              {wallet.address}
            </option>
          ))}
        </select>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
