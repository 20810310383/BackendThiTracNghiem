// models/KetQuaThi.js
const mongoose = require('mongoose');

const ketQuaThiSchema = new mongoose.Schema({
    nguoiDung: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    boDe: { type: mongoose.Schema.Types.ObjectId, ref: 'BoDe', required: true },

    soCauDung: { type: Number, required: true },
    soCauSai: { type: Number, required: true },
    diem: { type: Number, required: true },

    thoiGianLam: { type: Number, required: true }, // phút
    ngayThi: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KetQuaThi', ketQuaThiSchema);
