import React, { useState, useEffect } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ wallet, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
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

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const data = {
        sender: wallet.address,
        amount: parseInt(sendAmount),
        recipient,
      };
      const messageHash = toHex(keccak256(utf8ToBytes(JSON.stringify(data))));
      const signature = secp256k1.sign(messageHash, wallet.key).toCompactHex();
      const publicKey = toHex(secp256k1.getPublicKey(wallet.key));
      const {
        data: { balance },
      } = await server.post(`send`, {
        ...data,
        messageHash,
        signature,
        publicKey,
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  async function onChange(evt) {
    const w = wallets[evt.target.value];
    if (w) {
      setRecipient(w.address);
    } else {
      setRecipient("");
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <select onChange={onChange}>
          <option value="-1">Select an address</option>
          {wallets.map((wallet, i) => (
            <option key={i} value={i}>
              {wallet.address}
            </option>
          ))}
        </select>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
