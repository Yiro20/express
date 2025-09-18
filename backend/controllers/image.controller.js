const service = require("../services/image.service");

class ImageController {
  async getByProducto(req, res) {
    try {
      const { producto_id } = req.params;
      const imagenes = await service.getImagenesByProducto(producto_id);
      res.json(imagenes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const imagen = await service.createImagen(req.body);
      res.json(imagen);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await service.deleteImagen(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ImageController();
