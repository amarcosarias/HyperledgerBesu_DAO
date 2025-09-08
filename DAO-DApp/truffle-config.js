// Permite firmar transacciones y conectarte al nodo Besu vía HTTP.
const HDWalletProvider = require("@truffle/hdwallet-provider");

const privateKeys = ["9fbae0d6b7a4fd39f0e8b0830f0e9952aa3bb98837f91ecc8b7b6164feec8a33"]; 
const providerURL = "http://127.0.0.1:8545";

module.exports = {
  networks: {
    besu: {
      provider: () => new HDWalletProvider({
        privateKeys: privateKeys,
        providerOrUrl: providerURL,
        numberOfAddresses: 1,
      }),
      network_id: 2023,      
      gas: 7000000,
      gasPrice: 0,
      timeoutBlocks: 200,
      networkCheckTimeout: 1000000,
    },
  },

  // Versión de Solidity usada para compilar
  compilers: {
    solc: {
      version: "0.8.0",
    },
  },
};