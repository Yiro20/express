// routes/productos.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los productos con su primera imagen
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query(`
            SELECT 
                p.id, 
                p.nombre, 
                p.precio, 
                c.nombre AS categoria,
                (SELECT url FROM imagenes_productos 
                 WHERE producto_id = p.id 
                 LIMIT 1) AS imagen_principal
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener detalles de un producto con todas sus imágenes
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información básica del producto
    const [product] = await db.query(
      `
            SELECT 
                p.id, 
                p.nombre, 
                p.precio, 
                p.descripcion,
                c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `,
      [id]
    );

    // Obtener todas las imágenes del producto
    const [images] = await db.query(
      `
            SELECT url FROM imagenes_productos 
            WHERE producto_id = ?
        `,
      [id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      ...product[0],
      imagenes: images,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo producto con imágenes
router.post("/", async (req, res) => {
  const { nombre, precio, categoria_id, descripcion, imagenes } = req.body;

  try {
    // Iniciar transacción
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar producto principal
      const [productResult] = await connection.query(
        `INSERT INTO productos (nombre, precio, categoria_id, descripcion) 
                 VALUES (?, ?, ?, ?)`,
        [nombre, precio, categoria_id, descripcion]
      );

      const productId = productResult.insertId;

      // Insertar imágenes si existen
      if (imagenes && imagenes.length > 0) {
        for (const imageUrl of imagenes) {
          await connection.query(
            `INSERT INTO imagenes_productos (url, producto_id) 
                         VALUES (?, ?)`,
            [imageUrl, productId]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: "Producto creado exitosamente",
        productId,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
