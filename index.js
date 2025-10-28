const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware globales
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend/public")));
app.use(express.static(path.join(__dirname, "frontend/views")));

// 🛡️ Agregar esto: protección por IP
app.set('trust proxy', true); // Permite leer la IP real detrás de un proxy
const allowedIP = '45.232.149.130'; // Cambia por tu IP permitida real

app.use((req, res, next) => {
  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  if (
    clientIP.includes(allowedIP) || // IP autorizada
    clientIP.includes("127.0.0.1") || // localhost
    clientIP.includes("::1") || // IPv6 localhost
    clientIP.includes("10.") || // redes privadas
    clientIP.includes("172.") ||
    clientIP.includes("192.168")
  ) {
    next();
  } else {
    console.warn(`❌ Acceso bloqueado desde IP: ${clientIP}`);
    return res.status(403).json({ message: "Acceso denegado: IP no autorizada" });
  }
});

// Importar rutas
const authRoutes = require("./backend/routes/auth.route");
const categoriasRoutes = require("./backend/routes/category.route");
const productosRoutes = require("./backend/routes/product.route");
const imagenesRoutes = require("./backend/routes/image.route");

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/imagenes", imagenesRoutes);

// Rutas frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/views/store/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/views/admin/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/views/auth/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/views/auth/register.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});










