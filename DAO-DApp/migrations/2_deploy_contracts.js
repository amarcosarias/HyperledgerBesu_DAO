// Importa el contrato DAO compilado para poder desplegarlo
const DAO = artifacts.require("DAO");

// Define la función que ejecutará Truffle para desplegar el contrato
module.exports = async function (deployer, network, accounts) {

  // Define un array con la primera cuenta como miembro inicial del DAO
  const initialMembers = [accounts[0]];

  // Despliega el contrato DAO pasándole los miembros iniciales
  await deployer.deploy(DAO, initialMembers);
};