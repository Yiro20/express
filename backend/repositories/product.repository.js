const db = require("../config/database");

class ProductRepository {
  async getAll() {
    const [products] = await db.query(`
      SELECT 
        p.id, 
        p.nombre, 
        p.precio, 
        p.descripcion,
        c.nombre AS categoria,
        (SELECT url FROM imagenes_productos 
         WHERE producto_id = p.id 
         LIMIT 1) AS imagen_principal
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `);
    return products;
  }

  async getById(id) {
    const [product] = await db.query(
      `
      SELECT 
        p.id, 
        p.nombre, 
        p.precio, 
        p.descripcion,
        p.categoria_id,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (!product || product.length === 0) {
      return null;
    }

    return product[0];
  }

  async create(productData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [productResult] = await connection.query(
        `INSERT INTO productos (nombre, precio, categoria_id, descripcion) 
         VALUES (?, ?, ?, ?)`,
        [
          productData.nombre,
          productData.precio,
          productData.categoria_id,
          productData.descripcion,
        ]
      );

      const productId = productResult.insertId;

      if (productData.imagenes && productData.imagenes.length > 0) {
        for (const imageUrl of productData.imagenes) {
          await connection.query(
            `INSERT INTO imagenes_productos (url, producto_id) 
             VALUES (?, ?)`,
            [imageUrl, productId]
          );
        }
      }

      await connection.commit();
      return { id: productId, ...productData };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async update(id, productData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Actualizar datos básicos del producto
      await connection.query(
        `UPDATE productos SET nombre = ?, precio = ?, categoria_id = ?, descripcion = ? 
       WHERE id = ?`,
        [
          productData.nombre,
          productData.precio,
          productData.categoria_id,
          productData.descripcion,
          id,
        ]
      );

      // 2. Manejar imágenes - Solo si se proporcionan en el request
      if (productData.imagenes && Array.isArray(productData.imagenes)) {
        // Primero eliminar imágenes existentes
        await connection.query(
          "DELETE FROM imagenes_productos WHERE producto_id = ?",
          [id]
        );

        // Luego agregar las nuevas imágenes
        if (productData.imagenes.length > 0) {
          for (const imageUrl of productData.imagenes) {
            await connection.query(
              `INSERT INTO imagenes_productos (url, producto_id) 
             VALUES (?, ?)`,
              [imageUrl, id]
            );
          }
        }
      }

      await connection.commit();
      return { id: parseInt(id), ...productData };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async delete(id) {
    await db.query("DELETE FROM productos WHERE id = ?", [id]);
    return { message: "Producto eliminado" };
  }

  async findImagesByProductId(productId) {
    const [images] = await db.query(
      "SELECT id, url FROM imagenes_productos WHERE producto_id = ?",
      [productId]
    );
    return images;
  }

  async addImage(productId, imageUrl) {
    const [result] = await db.query(
      `INSERT INTO imagenes_productos (url, producto_id) 
       VALUES (?, ?)`,
      [imageUrl, productId]
    );
    return { id: result.insertId, url: imageUrl, producto_id: productId };
  }

  async deleteImage(imageId) {
    await db.query("DELETE FROM imagenes_productos WHERE id = ?", [imageId]);
    return { message: "Imagen eliminada" };
  }
}

module.exports = new ProductRepository();
