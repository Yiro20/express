const service = require("../services/product.service");

class ProductController {
  async getAll(req, res) {
    try {
      const productos = await service.getAllProductos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await service.getProductoById(id);
      res.json(producto);
    } catch (error) {
      if (error.message === "Producto no encontrado") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req, res) {
    try {
      const producto = await service.createProducto(req.body);
      res.status(201).json({
        message: "Producto creado exitosamente",
        productId: producto.id,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const producto = await service.updateProducto(id, req.body);
      res.json({
        message: "Producto actualizado exitosamente",
        product: producto,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await service.deleteProducto(id);
      res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addImage(req, res) {
    try {
      const { productId } = req.params;
      const { url } = req.body;

      const image = await service.addImageToProduct(productId, url);
      res.status(201).json({
        message: "Imagen agregada exitosamente",
        image: image,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const { imageId } = req.params;
      await service.deleteImageFromProduct(imageId);
      res.json({ message: "Imagen eliminada exitosamente" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ProductController();
