const express = require("express");
const { createDeThi, getDeThi, updateProduct, deleteBode, getOneDeThi, countBoDeByMonHoc, getDetailDeThi, addMultipleCauHoi, updateMultipleCauHoi } = require("../controllers/DeThi/deThi.controller");
const router = express.Router();

router.get("/get-bo-de", getDeThi);
router.get("/get-detail-bo-de", getDetailDeThi);
router.get("/get-one-bo-de", getOneDeThi);
router.get('/count-bo-de-by-monhoc', countBoDeByMonHoc);

router.post("/create-bo-de", createDeThi);
router.post("/add-multiple-cau-hoi", addMultipleCauHoi);
router.put("/update-bo-de", updateProduct);
router.post("/update-multiple-cau-hoi", updateMultipleCauHoi);
router.delete("/delete-bo-de/:id", deleteBode);

module.exports = router;