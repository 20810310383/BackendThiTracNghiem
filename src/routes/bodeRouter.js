const express = require("express");
const { createDeThi, getDeThi, updateProduct, deleteBode, getOneDeThi, countBoDeByMonHoc, getDetailDeThi } = require("../controllers/DeThi/deThi.controller");
const router = express.Router();

router.get("/get-bo-de", getDeThi);
router.get("/get-detail-bo-de", getDetailDeThi);
router.get("/get-one-bo-de", getOneDeThi);
router.get('/count-bo-de-by-monhoc', countBoDeByMonHoc);

router.post("/create-bo-de", createDeThi);
router.put("/update-bo-de", updateProduct);
router.delete("/delete-bo-de/:id", deleteBode);

module.exports = router;