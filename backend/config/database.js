const mysql = require("mysql2");
// Crear pool de conexiones para manejar múltiples requests
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "tienda1",
});
// Promisify para usar async/await
const promisePool = pool.promise();
module.exports = promisePool;
