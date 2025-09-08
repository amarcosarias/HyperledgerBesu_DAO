import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

// Import icono
import AddUser from "../assets/adduser.png";

function AddMember({ contract, account, web3 }) {
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [isMining, setIsMining] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setNewMemberAddress(e.target.value);
    setStatusMessage(""); // Limpiar mensaje anterior
  };

  const addMember = async () => {
    if (!web3.utils.isAddress(newMemberAddress)) {
      setStatusMessage("❌ Dirección Ethereum inválida.");
      return;
    }

    try {
      setIsMining(true);
      setStatusMessage("⛏️ Enviando transacción...");

      await contract.methods.addMember(newMemberAddress).send({
        from: account,
        gas: 100000,
        gasPrice: "0",
      });

      setStatusMessage("✅ Miembro agregado con éxito.");
      setNewMemberAddress("");

      // Redirige a /members tras éxito
      navigate("/members");
    } catch (error) {
      console.error("Error al agregar miembro:", error);
      setStatusMessage("❌ Error al agregar miembro.");
    } finally {
      setIsMining(false);
    }
  };

  return (
    <Layout>
      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src={AddUser}
          alt="Agregar usuario"
          style={{ width: "40px", height: "40px", verticalAlign: "middle" }}
        />
        Agregar nuevo miembro
      </h2>

      <input
        type="text"
        value={newMemberAddress}
        onChange={handleChange}
        placeholder="Introduce la dirección del nuevo miembro"
        style={{
          width: "100%",
          padding: "0.6rem",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          backgroundColor: "#f5f5f5",
          color: "#333",
        }}
      />

      <br />

      <button
        onClick={addMember}
        disabled={isMining}
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: isMining ? "#999" : "#007bff",
          color: "white",
          cursor: isMining ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
      >
        Agregar Miembro
      </button>

      {statusMessage && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{statusMessage}</p>
      )}
    </Layout>
  );
}

export default AddMember;