const repository = require("../repositories/category.repository");

class CategoryService {
  async getAllCategorias() {
    return await repository.getAll();
  }

  async createCategoria(categoriaData) {
    if (!categoriaData.nombre) {
      throw new Error("El nombre de la categoría es requerido");
    }
    return await repository.create(categoriaData);
  }

  async updateCategoria(id, categoriaData) {
    if (!categoriaData.nombre) {
      throw new Error("El nombre de la categoría es requerido");
    }
    return await repository.update(id, categoriaData);
  }

  async deleteCategoria(id) {
    return await repository.delete(id);
  }
}

module.exports = new CategoryService();
