const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/profile", auth, controller.profile);

module.exports = router;
