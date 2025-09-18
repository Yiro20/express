const db = require("../config/database");
const bcrypt = require("bcrypt");

class UserRepository {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [
        userData.nombre,
        userData.email,
        hashedPassword,
        userData.rol || "cliente",
      ]
    );
    return { id: result.insertId, ...userData };
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new UserRepository();
