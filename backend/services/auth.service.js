const repository = require("../repositories/user.repository");
const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "c5947ed70ffd0e6f585db7f526f93e6107221cbb4250d00e603805feb5517fb2b9ca353c79a46be8b827066971d92fbaab25f63694ef6734cbdc8273f70a2d84";

class AuthService {
  async login(email, password) {
    const user = await repository.findByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isValidPassword = await repository.verifyPassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Contraseña incorrecta");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET || "secreto",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET || "secreto");
    } catch (error) {
      throw new Error("Token inválido");
    }
  }

  async register(userData) {
    const existingUser = await repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    return await repository.create(userData);
  }
}

module.exports = new AuthService();
