const service = require("../services/auth.service");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await service.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const user = await service.register(req.body);
      res
        .status(201)
        .json({ message: "Usuario registrado exitosamente", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async profile(req, res) {
    try {
      // El usuario ya está autenticado por el middleware
      res.json({ user: req.user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
