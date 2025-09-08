import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

// Icons
import Execute from "../assets/execute.png";
import Pending from "../assets/pending.png";
import Results from "../assets/results.png";

function Proposals({ contract, account, isMember, chairperson, web3 }) {
  const [proposals, setProposals] = useState([]);
  const [isMining, setIsMining] = useState(false);

  useEffect(() => {
    if (!contract || !account) return;
    loadProposals();
  }, [contract, account]);

  async function loadProposals() {
    try {
      const count = await contract.methods.getProposalsCount().call();
      const loaded = [];

      for (let i = 0; i < count; i++) {
        try {
          const proposal = await contract.methods.getProposal(i).call({ from: account });

          loaded.push({
            index: i,
            description: proposal.description,
            options: proposal.options,
            voteCounts: proposal.voteCounts.map(Number),
            executed: proposal.executed,
            hasVoted: proposal.hasVoted,
            winningOption:
              proposal.executed && Number(proposal.winningVotes) > 0
                ? { option: proposal.winningOption, votes: Number(proposal.winningVotes) }
                : null,
          });
        } catch (innerErr) {
          console.error(`❌ Error al obtener propuesta #${i}:`, innerErr);
        }
      }

      setProposals(loaded);
    } catch (err) {
      console.error("❌ Error general al cargar propuestas:", err);
    }
  }

  async function vote(proposalIndex, optionIndex) {
    try {
      setIsMining(true);
      const gasPrice = await web3.eth.getGasPrice();

      await contract.methods.vote(proposalIndex, optionIndex).send({
        from: account,
        gas: 200000,
        gasPrice,
      });

      await loadProposals();
    } catch (err) {
      console.error("❌ Error al votar:", err);
      const reason = err?.message?.match(/reason=\"([^\"]+)\"/)?.[1] || err.message;
      alert(`❌ Error al votar: ${reason}`);
    } finally {
      setIsMining(false);
    }
  }

  async function execute(index) {
    try {
      setIsMining(true);
      const gasPrice = await web3.eth.getGasPrice();

      await contract.methods.executeProposal(index).send({
        from: account,
        gas: 200000,
        gasPrice,
      });

      await loadProposals();
    } catch (err) {
      console.error("❌ Error al ejecutar propuesta:", err);
      const reason = err?.message?.match(/reason=\"([^\"]+)\"/)?.[1] || err.message;
      alert(`❌ No se pudo ejecutar: ${reason}`);
    } finally {
      setIsMining(false);
    }
  }

  const pendingProposals = proposals.filter((p) => !p.executed);
  const executedProposals = proposals.filter((p) => p.executed);

  return (
    <Layout>
      {isMining && <p>⛏️ Procesando transacción en la blockchain...</p>}

      <div style={{ display: "flex", gap: "6rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Propuestas pendientes */}
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <img src={Pending} alt="Pendientes" style={{ width: "40px", height: "40px" }} />
            Propuestas pendientes
          </h2>

          {pendingProposals.length === 0 ? (
            <p>No hay propuestas pendientes.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {pendingProposals.map((p) => {
                const totalVotes = p.voteCounts.reduce((a, b) => a + b, 0);

                return (
                  <li
                    key={p.index}
                    style={{
                      marginBottom: "1rem",
                      padding: "1.7rem",
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <strong style={{ fontSize: "1.2rem" }}>
                      {p.index}: {p.description}
                    </strong>

                    <ul style={{ paddingLeft: 0, marginTop: "1rem" }}>
                      {p.options.map((opt, idx) => {
                        const count = p.voteCounts[idx];
                        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

                        return (
                          <li key={idx} style={{ marginBottom: "1.5rem" }}>
                            <div style={{ marginBottom: "0.3rem" }}>{opt}</div>

                            <div
                              style={{
                                backgroundColor: "#ddd",
                                borderRadius: "6px",
                                overflow: "hidden",
                                height: "20px",
                              }}
                            >
                              <div
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: "#007bff",
                                  height: "100%",
                                }}
                              />
                            </div>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "0.5rem",
                              }}
                            >
                              <span style={{ color: "#555" }}>{count} votos</span>

                              {!p.hasVoted && isMember && (
                                <button
                                  onClick={() => vote(p.index, idx)}
                                  disabled={isMining}
                                  style={{
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "0.4rem 0.8rem",
                                    cursor: isMining ? "not-allowed" : "pointer",
                                  }}
                                >
                                  Votar
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {p.hasVoted && (
                      <p style={{ color: "gray", fontStyle: "italic" }}>
                        Ya votaste en esta propuesta
                      </p>
                    )}

                    {account === chairperson && (
                      <button
                        onClick={() => execute(p.index)}
                        disabled={isMining}
                        style={{
                          marginTop: "10px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.5rem 1rem",
                          cursor: isMining ? "not-allowed" : "pointer",
                        }}
                      >
                        Ejecutar propuesta
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Propuestas ejecutadas */}
        <div style={{ flex: 1, minWidth: "400px" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <img src={Execute} alt="Ejecutadas" style={{ width: "40px", height: "40px" }} />
            Propuestas ejecutadas
          </h2>

          {executedProposals.length === 0 ? (
            <p>No hay propuestas ejecutadas aún.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {executedProposals.map((p) => (
                <li
                  key={p.index}
                  style={{
                    marginBottom: "1rem",
                    padding: "1.7rem",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    backgroundColor: "#eaeaea",
                  }}
                >
                  <strong style={{ fontSize: "1.2rem" }}>
                    {p.index}: {p.description}
                  </strong>

                  {p.winningOption ? (
                    <p style={{ marginTop: "0.5rem", color: "black", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <img src={Results} alt="Resultado" style={{ width: "25px", height: "25px" }} />
                      Resultado: <strong>{p.winningOption.option}</strong> (
                      {p.winningOption.votes} votos)
                    </p>
                  ) : (
                    <p style={{ marginTop: "0.5rem", color: "gray" }}>
                      La propuesta fue ejecutada, pero no recibió votos.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Proposals;