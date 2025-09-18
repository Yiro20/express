const service = require("../services/category.service");

class CategoryController {
  async getAll(req, res) {
    try {
      const categorias = await service.getAllCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const categoria = await service.createCategoria(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const categoria = await service.updateCategoria(id, req.body);
      res.json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await service.deleteCategoria(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController();
