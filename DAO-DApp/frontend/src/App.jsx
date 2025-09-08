import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import getWeb3 from "./getWeb3";
import DAOABI from "../../build/contracts/DAO.json";

// Rutas
import Home from "./routes/Home";
import Proposals from "./routes/Proposals";
import CreateProposal from "./routes/CreateProposal";
import AddMember from "./routes/AddMember";
import Members from "./routes/Members";

// Estilos globales
import "./App.css";
// Importa icono
import DAOIcon from "./assets/icon.png";

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [chairperson, setChairperson] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupRef = useRef(null);

  async function updateMemberStatus(contractInstance, account) {
    if (contractInstance && account) {
      try {
        const memberStatus = await contractInstance.methods.isMember(account).call();
        setIsMember(memberStatus);
      } catch (error) {
        console.error("Error verificando el estado de miembro:", error);
        setIsMember(false);
      }
    }
  }

  useEffect(() => {
    let instance;

    async function init() {
      try {
        const web3Instance = await getWeb3();
        setWeb3(web3Instance);

        const accountsList = await web3Instance.eth.getAccounts();
        setAccounts(accountsList);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = DAOABI.networks[networkId];

        if (!deployedNetwork) {
          alert("Contrato no desplegado en esta red");
          setIsLoading(false);
          return;
        }

        instance = new web3Instance.eth.Contract(DAOABI.abi, deployedNetwork.address);
        setContract(instance);

        const chair = await instance.methods.chairperson().call();
        setChairperson(chair);

        const memCount = await instance.methods.countMembers().call();
        setMemberCount(memCount);

        await updateMemberStatus(instance, accountsList[0]);

        if (window.ethereum) {
          const handleAccountsChanged = async (accountsChanged) => {
            if (accountsChanged.length > 0) {
              setAccounts(accountsChanged);
              if (instance) {
                try {
                  const chair = await instance.methods.chairperson().call();
                  setChairperson(chair);

                  const memCount = await instance.methods.countMembers().call();
                  setMemberCount(memCount);

                  await updateMemberStatus(instance, accountsChanged[0]);
                } catch (error) {
                  console.error("Error actualizando estado tras cambio de cuenta:", error);
                }
              }
            } else {
              setAccounts([]);
              setIsMember(false);
            }
          };

          const handleChainChanged = () => {
            window.location.reload();
          };

          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);

          cleanupRef.current = () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum.removeListener("chainChanged", handleChainChanged);
          };
        }
      } catch (error) {
        console.error("Error al inicializar:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (contract && accounts.length > 0) {
      updateMemberStatus(contract, accounts[0]);
    }
  }, [accounts, contract]);

  if (isLoading) return (
    <div className="container">
      <div className="card">
        <p style={{ fontSize: "1.5rem" }}>Cargando DAO...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <nav>
        <Link to="/">
          <img
            src={DAOIcon}
            alt="DAO icon"
            style={{ width: "40px", height: "40px", marginRight: "0.75rem", verticalAlign: "middle" }}
          />
          DAO - TFM 2025
        </Link>
        {accounts[0] === chairperson && <Link to="/add-member">Agregar Miembro</Link>}
        <Link to="/members">Miembros</Link>
        {isMember && <Link to="/create-proposal">Crear Propuesta</Link>}
        <Link to="/proposals">Propuestas</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <Home
            accounts={accounts}
            chairperson={chairperson}
            memberCount={memberCount}
            isMember={isMember}
          />
        } />
        <Route path="/proposals" element={
          <Proposals
            contract={contract}
            account={accounts[0]}
            isMember={isMember}
            chairperson={chairperson}
            web3={web3}
          />
        } />
        <Route path="/create-proposal" element={
          isMember ? (
            <CreateProposal contract={contract} account={accounts[0]} web3={web3} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/members" element={
          <Members contract={contract} account={accounts[0]} />
        } />
        <Route path="/add-member" element={
          accounts[0] === chairperson ? (
            <AddMember contract={contract} account={accounts[0]} web3={web3} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="*" element={
          <div className="container">
            <div className="card">
              <p>404: Página no encontrada</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;