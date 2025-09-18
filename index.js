const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Importar path
const app = express();
const PORT = 3000;
// Middlewares
// --Permitir CORS
app.use(cors());
// --Parsear JSON en requests
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos
// Importar rutas
const categoriasRoutes = require("./routes/categorias");
const productosRoutes = require("./routes/productos");
const imagenesRoutes = require("./routes/imagenes");
// Registrar rutas
app.use("/categorias", categoriasRoutes);
app.use("/productos", productosRoutes);
app.use("/imagenes", imagenesRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
