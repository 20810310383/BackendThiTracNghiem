const express = require("express");
const { luuKetQuaThi, layKetQuaTheoBoDe, layKetQuaTheoUser } = require("../controllers/KetQuaThi/ketqua.controller");
const router = express.Router();

router.post('/luu-ketqua', luuKetQuaThi);
router.get('/get-ketqua', layKetQuaTheoBoDe);
router.get('/get-ketqua-by-user', layKetQuaTheoUser);


module.exports = router;