const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "frontend/public")));
app.use(express.static(path.join(__dirname, "frontend/views")));

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
