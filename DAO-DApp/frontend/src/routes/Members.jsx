import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Layout from "../components/Layout";

// Imports iconos
import MembersIcon from "../assets/members.png";
import Admin from "../assets/admin.png";
import DeleteUser from "../assets/deleteuser.png";

function Members({ contract, account }) {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [chairperson, setChairperson] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const count = await contract.methods.countMembers().call();
        const loaded = [];

        for (let i = 0; i < count; i++) {
          const member = await contract.methods.memberList(i).call();
          loaded.push(member);
        }

        const chair = await contract.methods.chairperson().call();
        setChairperson(chair);
        setMembers(loaded);
      } catch (error) {
        console.error("Error cargando miembros:", error);
      }
    }

    if (contract) fetchData();
  }, [contract]);

  const handleRemove = async (address) => {
    try {
      if (!window.ethereum) {
        setStatus("❌ No se encontró provider (Metamask).");
        return;
      }

      // Instancia local solo para utilidades y llamadas web3
      const web3 = new Web3(window.ethereum);

      // Validar con la librería 
      if (!Web3.utils.isAddress(address)) {
        setStatus("❌ Dirección inválida.");
        return;
      }

      // Asegura permisos de cuenta
      await window.ethereum.request({ method: "eth_requestAccounts" });

      setIsMining(true);
      setStatus(`⛏️ Eliminando miembro ${address}...`);

      // Prepara la transacción
      const tx = contract.methods.removeMember(address);

      // Estimar gas con los mismos parámetros que usaremos
      const gas = await tx.estimateGas({ from: account });

      // Forzar tx tipo 0 (legacy) en redes sin EIP-1559
      const gasPrice = await web3.eth.getGasPrice();

      await tx.send({
        from: account,
        gas,
        gasPrice,
      });

      setStatus(`✅ Miembro ${address} eliminado.`);
      setMembers((prev) =>
        prev.filter((addr) => addr.toLowerCase() !== address.toLowerCase())
      );
    } catch (error) {
      console.error(error);
      setStatus(`❌ Error al eliminar miembro. ${error?.message ?? ""}`);
    } finally {
      setIsMining(false);
    }
  };

  const isChairperson = account?.toLowerCase() === chairperson?.toLowerCase();

  return (
    <Layout>
      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src={MembersIcon}
          alt="Miembros"
          style={{ width: "40px", height: "40px", verticalAlign: "middle" }}
        />
        Miembros actuales
      </h2>

      {members.length === 0 ? (
        <p>No hay miembros registrados.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {members.map((addr, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              {/* Dirección alineada a la izquierda con espacio a la derecha */}
              <div
                style={{
                  flex: 1,
                  wordBreak: "break-all",
                  marginRight: "2rem", // Espacio entre dirección e iconos
                }}
              >
                {addr}
              </div>

              {/* Iconos alineados a la derecha */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {addr.toLowerCase() === chairperson?.toLowerCase() && (
                  <img
                    src={Admin}
                    alt="Admin"
                    title="Chairperson"
                    style={{ width: "30px", height: "30px" }}
                  />
                )}

                {isChairperson && addr.toLowerCase() !== chairperson?.toLowerCase() && (
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: isMining ? "not-allowed" : "pointer",
                      padding: 0,
                    }}
                    onClick={() => handleRemove(addr)}
                    disabled={isMining}
                    title="Eliminar miembro"
                  >
                    <img
                      src={DeleteUser}
                      alt="Eliminar"
                      style={{ width: "30px", height: "30px" }}
                    />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {status && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{status}</p>
      )}
    </Layout>
  );
}

export default Members;