const repository = require("../repositories/product.repository");

class ProductService {
  async getAllProductos() {
    return await repository.getAll();
  }

  async getProductoById(id) {
    const producto = await repository.getById(id);
    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    const imagenes = await repository.findImagesByProductId(id);
    return {
      ...producto,
      imagenes,
    };
  }

  async createProducto(productoData) {
    if (
      !productoData.nombre ||
      !productoData.precio ||
      !productoData.categoria_id
    ) {
      throw new Error("Nombre, precio y categoría son requeridos");
    }

    // Validar máximo de imágenes
    if (productoData.imagenes && productoData.imagenes.length > 3) {
      throw new Error("Máximo 3 imágenes permitidas por producto");
    }

    return await repository.create(productoData);
  }

  async updateProducto(id, productoData) {
    if (
      !productoData.nombre ||
      !productoData.precio ||
      !productoData.categoria_id
    ) {
      throw new Error("Nombre, precio y categoría son requeridos");
    }

    // Validar máximo de imágenes si se están actualizando
    if (productoData.imagenes && productoData.imagenes.length > 3) {
      throw new Error("Máximo 3 imágenes permitidas por producto");
    }

    return await repository.update(id, productoData);
  }

  async deleteProducto(id) {
    return await repository.delete(id);
  }

  async addImageToProduct(productId, imageUrl) {
    // Verificar que no exceda el límite de 3 imágenes
    const existingImages = await repository.findImagesByProductId(productId);
    if (existingImages.length >= 3) {
      throw new Error("Máximo 3 imágenes permitidas por producto");
    }

    return await repository.addImage(productId, imageUrl);
  }

  async deleteImageFromProduct(imageId) {
    return await repository.deleteImage(imageId);
  }
}

module.exports = new ProductService();
