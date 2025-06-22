const express = require("express");
const { luuKetQuaThi, layKetQuaTheoBoDe } = require("../controllers/KetQuaThi/ketqua.controller");
const router = express.Router();

router.post('/luu-ketqua', luuKetQuaThi);
router.get('/get-ketqua', layKetQuaTheoBoDe);


module.exports = router;