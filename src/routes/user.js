const express = require("express");
const { getAllUser, getAllUserWithStats } = require("../controllers/User/user.controller");

const router = express.Router();

router.get("/get-all-user", getAllUserWithStats);

module.exports = router;