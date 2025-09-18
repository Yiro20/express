const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const { auth, authorize } = require("../middlewares/auth");

const rol = authorize(["admin"]);

// Rutas públicas
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Rutas protegidas (solo admin)
router.post("/", auth, rol, controller.create);
router.put("/:id", auth, rol, controller.update);
router.delete("/:id", auth, rol, controller.delete);

// Rutas para gestión de imágenes
router.post("/:productId/images", auth, rol, controller.addImage);
router.delete("/images/:imageId", auth, rol, controller.deleteImage);

module.exports = router;
