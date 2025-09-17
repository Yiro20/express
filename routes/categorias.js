const express = require("express");
const router = express.Router();
const db = require("../db");
// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Crear nueva categoría
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO categorias (nombre) VALUES (?)",
      [nombre]
    );
    res.json({ id: result.insertId, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Actualizar categoría
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    await db.query("UPDATE categorias SET nombre = ? WHERE id = ?", [
      nombre,
      id,
    ]);
    res.json({ id, nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Eliminar categoría
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM categorias WHERE id = ?", [id]);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
function registerCategory(name) {
  if (!name) {
    alert("Por favor ingrese un nombre válido");
    return;
  }
  fetch("/categorias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nombre: name }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      alert("Categoría registrada con éxito");
      document.getElementById("category-name").value = "";
      loadCategories(); // Recargar la lista de categorías
      updateCategoryDropdown(); // Actualizar el dropdown en el formulario de productos
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al registrar la categoría");
    });
}
module.exports = router;
