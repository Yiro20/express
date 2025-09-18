const db = require("../config/database");

class CategoryRepository {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM categorias");
    return rows;
  }

  async create(categoryData) {
    const [result] = await db.query(
      "INSERT INTO categorias (nombre) VALUES (?)",
      [categoryData.nombre]
    );
    return { id: result.insertId, ...categoryData };
  }

  async update(id, categoryData) {
    await db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [
      categoryData.nombre,
      id,
    ]);
    return { id: parseInt(id), ...categoryData };
  }

  async delete(id) {
    await db.query("DELETE FROM categorias WHERE id = ?", [id]);
    return { mensaje: "Categoría eliminada" };
  }
}

module.exports = new CategoryRepository();
