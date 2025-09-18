const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
const { auth, authorize } = require("../middlewares/auth");

router.get("/", controller.getAll);

router.post("/", auth, authorize(["admin"]), controller.create);
router.put("/:id", auth, authorize(["admin"]), controller.update);
router.delete("/:id", auth, authorize(["admin"]), controller.delete);

module.exports = router;
