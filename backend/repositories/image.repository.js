const db = require("../config/database");

class ImageRepository {
  async findByProductId(producto_id) {
    const [rows] = await db.query(
      "SELECT * FROM imagenes_productos WHERE producto_id = ?",
      [producto_id]
    );
    return rows;
  }

  async create(imagenData) {
    const [result] = await db.query(
      "INSERT INTO imagenes_productos (url, producto_id) VALUES (?, ?)",
      [imagenData.url, imagenData.producto_id]
    );
    return { id: result.insertId, ...imagenData };
  }

  async delete(id) {
    await db.query("DELETE FROM imagenes_productos WHERE id = ?", [id]);
    return { mensaje: "Imagen eliminada" };
  }
}

module.exports = new ImageRepository();
