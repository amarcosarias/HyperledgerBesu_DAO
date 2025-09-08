import React from "react";
import Layout from "../components/Layout";

// Imports iconos
import Information from "../assets/information.png";

function Home({ accounts, chairperson, memberCount, isMember }) {
  const currentAccount = accounts && accounts.length > 0 ? accounts[0] : "No conectada";

  return (
    <Layout>
      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
          src={Information}
          alt="Home"
          style={{ width: "40px", height: "40px", verticalAlign: "middle" }}
        />
        Información de la DAO
      </h2>

      <div className="info-block">
        <p><span className="label">Cuenta conectada:</span><br />{currentAccount}</p>
        <p><span className="label">Chairperson:</span><br />{chairperson || "Cargando..."}</p>
        <p><span className="label">Número de miembros:</span><br />{memberCount}</p>
        <p><span className="label">Eres miembro:</span><br />{isMember ? "Sí" : "No"}</p>

        {!isMember && (
          <p className="warning">No eres miembro de esta DAO.</p>
        )}
      </div>
    </Layout>
  );
}

export default Home;