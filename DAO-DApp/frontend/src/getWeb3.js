// src/getWeb3.js
import Web3 from "web3";

async function getWeb3() {

  // Comprobar si Metamask u otra wallet compatible está instalada y activa.
  if (window.ethereum) {

    const web3 = new Web3(window.ethereum);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
      throw error;
    }

    return web3;
    
  } else {
    // Navegador no tiene Metamask
    console.warn("No Metamask detected, using fallback to local provider.");
    // Aunque no se pueda firmar transacciones (no Metamask), se podrá leer datos o interactuar en modo lectura
    return new Web3("http://127.0.0.1:8545");
  }
}

export default getWeb3;