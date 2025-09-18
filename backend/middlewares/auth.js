const authService = require('../services/auth.service');

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }

    const decoded = await authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token no valido" });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "Acceso prohibido" });
    }
    next();
  };
};

module.exports = { auth, authorize };
