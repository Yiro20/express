const repository = require("../repositories/image.repository");

class ImageService {
  async getImagenesByProducto(producto_id) {
    return await repository.findByProductId(producto_id);
  }

  async createImagen(imagenData) {
    if (!imagenData.url || !imagenData.producto_id) {
      throw new Error("URL y producto_id son requeridos");
    }
    return await repository.create(imagenData);
  }

  async deleteImagen(id) {
    return await repository.delete(id);
  }
}

module.exports = new ImageService();
