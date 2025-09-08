import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

// Imports iconos
import CreateProposalIcon from "../assets/createproposal.png";
import X from "../assets/x.png";

function CreateProposal({ contract, account, web3 }) {
  const [proposalDescription, setProposalDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMining, setIsMining] = useState(false);
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOptionField = () => {
    setOptions([...options, ""]);
  };

  const removeOptionField = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const createProposal = async () => {
    const cleanOptions = options.map(opt => opt.trim()).filter(opt => opt !== "");
    const hasDuplicates = new Set(cleanOptions).size !== cleanOptions.length;

    if (!proposalDescription.trim() || cleanOptions.length < 2) {
      alert("Debes ingresar una descripción y al menos dos opciones.");
      return;
    }

    if (hasDuplicates) {
      alert("Las opciones deben ser únicas.");
      return;
    }

    try {
      setIsMining(true);

      const gasPrice = await web3.eth.getGasPrice();

      const tx = await contract.methods
        .createProposal(proposalDescription, cleanOptions)
        .send({
          from: account,
          gas: 300000,
          gasPrice,
        });

      console.log("✅ Transacción de creación completada:", tx);

      alert("✅ Propuesta creada con éxito.");

      // Redirige a /proposals tras éxito
      navigate("/proposals");
    } catch (error) {
      console.error("❌ Error al crear propuesta:", error);
      const reason = error?.message?.match(/reason="([^"]+)"/)?.[1] || error.message;
      alert(`❌ Error al crear propuesta: ${reason}`);
    } finally {
      setIsMining(false);
    }
  };

  return (
    <Layout>
      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src={CreateProposalIcon}
          alt="Crear propuesta"
          style={{ width: "40px", height: "40px", verticalAlign: "middle" }}
        />
        Crear nueva propuesta
      </h2>

      <input
        type="text"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e.target.value)}
        placeholder="Descripción de la propuesta"
        disabled={isMining}
        style={{
          width: "100%",
          padding: "0.6rem",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "#f5f5f5", 
          color: "#333",
          marginBottom: "1rem"
        }}
      />

      <h4 style={{ marginBottom: "0.5rem" }}>Opciones:</h4>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "0.5rem" }}>
          <input
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Opción ${idx + 1}`}
            disabled={isMining}
            style={{
              flex: 1,
              padding: "0.5rem",
              fontSize: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5", 
              color: "#333"
            }}
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOptionField(idx)}
              disabled={isMining}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.3rem",
                cursor: isMining ? "not-allowed" : "pointer",
              }}
              title="Quitar opción"
            >
              <img
                src={X}
                alt="Eliminar"
                style={{
                  width: "25px",
                  height: "25px",
                  display: "block",
                }}
              />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addOptionField}
        disabled={isMining}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          fontSize: "1rem",
          backgroundColor: "#007bff", 
          color: "white",
          border: "none",
          cursor: isMining ? "not-allowed" : "pointer"
        }}
      >
        Añadir opción
      </button>

      <br />

      <button
        onClick={createProposal}
        disabled={isMining}
        style={{
          marginTop: "1rem",
          padding: "0.6rem 1.2rem",
          borderRadius: "6px",
          fontSize: "1rem",
          backgroundColor: "#007bff", 
          color: "white",
          border: "none",
          cursor: isMining ? "not-allowed" : "pointer"
        }}
      >
        Crear Propuesta
      </button>

      {isMining && <p style={{ marginTop: "1rem" }}>⛏️ Minando transacción...</p>}
    </Layout>
  );
}

export default CreateProposal;