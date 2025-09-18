const express = require("express");
const router = express.Router();
const controller = require("../controllers/image.controller");

router.get("/:producto_id", controller.getByProducto);
router.post("/", controller.create);
router.delete("/:id", controller.delete);

module.exports = router;
