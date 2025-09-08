// src/components/Layout.jsx
import React from "react";

function Layout({ children }) {
  return (
    <div className="container">
      <div className="card">
        {children}
      </div>
    </div>
  );
}

export default Layout;