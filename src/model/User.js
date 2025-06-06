const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    hoTen: { type: String, },              // Ví dụ: "Nguyễn Văn A"
    Image: { type: String, },              // Ví dụ: "Nguyễn Văn A"
    email: { type: String, },
    matKhau: { type: String, },

    vaiTro: {
        type: String,
        enum: ['admin', 'hoc_sinh'],
        default: 'hoc_sinh'
    },

    ngayTao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
