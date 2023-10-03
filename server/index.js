const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { toHex } = require('ethereum-cryptography/utils')
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

let accounts = {};
let wallets = [];

app.get("/wallets", (req, res) => {
  res.send(wallets);
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = accounts[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, messageHash, signature, publicKey } = req.body;

  if (!isValidTransaction(messageHash, signature, sender, publicKey)) {
    res.status(400).send({ message: "Not a valid Sender" })
  }
  else if (accounts[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    accounts[sender] -= amount;
    accounts[recipient] += amount;
    res.send({ balance: accounts[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  for (let i = 0; i < 10; i++) {
    let privateKey = secp256k1.utils.randomPrivateKey();
    let publicKey = secp256k1.getPublicKey(privateKey);
    wallets.push({ address: `0x${toHex(publicKey.slice(1).slice(-20))}`, key: toHex(privateKey) });
    accounts[`0x${toHex(publicKey.slice(1).slice(-20))}`] = 100;
  }
});


function isValidTransaction(messageHash, signature, sender, publicKey) {
  try {
    const isSigned = secp256k1.verify(signature, messageHash, publicKey)
    const isValidSender = (sender.slice(2).toString() === publicKey.slice(-40)) ? true : false

    if (isValidSender && isSigned) return true

    return false
  } catch (e) {
    console.error(e);
    return false;
  }
}