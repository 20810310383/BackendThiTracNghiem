const mongoose = require('mongoose');

// Schema đáp án cho mỗi câu hỏi
const dapAnSchema = new mongoose.Schema({
    ma: { type: String, required: true },            // Ví dụ: "A", "B"
    noiDung: { type: String, required: true },
    isDung: { type: Boolean, default: false },
    giaiThich: { type: String, default: '' }
});

// Schema câu hỏi
const cauHoiSchema = new mongoose.Schema({
    noiDung: { type: String, required: true },
    dapAn: [dapAnSchema],
    mucDo: {
        type: String,
        enum: ['de', 'trung_binh', 'kho'],
        default: 'trung_binh',
    },
    tags: [String],
    ngayTao: { type: Date, default: Date.now }
});

// Schema bộ đề
const boDeSchema = new mongoose.Schema({
    ten: { type: String,  },                            // Tên bộ đề: "Đề thi thử Toán"
    matKhau: { type: String, },                           
    Image: { type: String, required: false },     
    monHoc: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MonHoc', 
         
    },
    capHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'CapHoc',  },
    moTa: { type: String },

    thoiGianThi: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ThoiGianThi', 
    },
    diemMoiCau: { type: Number, default: 0 },                         // Sẽ tự tính khi thêm câu hỏi
    luotThi: { type: Number, default: 10 },     

    phamViShare: { type: Boolean, default: true }, // true: công khai, false: riêng tư
    nguoiTao: { type: mongoose.Schema.Types.ObjectId, ref: 'User', }, // Người tạo bộ đề             

    cauHoi: [cauHoiSchema],
    ngayTao: { type: Date, default: Date.now }
});

// 🧠 Middleware: tự động tính điểm mỗi câu khi lưu
// boDeSchema.pre('save', function (next) {
//     if (this.cauHoi && this.cauHoi.length > 0) {
//         this.diemMoiCau = +(10 / this.cauHoi.length).toFixed(2); // làm tròn 2 chữ số thập phân
//     }
//     next();
// });

module.exports = mongoose.model('BoDe', boDeSchema);


// ví dụ
// {
//   "ten": "Đề thi thử Toán – Tháng 6",
//   "monHoc": "6650a1686aece88aa95c1f02", 
//   "moTa": "Ôn tập chuẩn bị kỳ thi đại học môn Toán",
//   "thoiGianThi": 90,
//   "cauHoi": [
//     {
//       "noiDung": "Số 1 + 1 = ?",
//       "dapAn": [
//         { "ma": "A", "noiDung": "2", "isDung": true, "giaiThich": "1 + 1 = 2" },
//         { "ma": "B", "noiDung": "1", "isDung": false },
//         { "ma": "C", "noiDung": "0", "isDung": false },
//         { "ma": "D", "noiDung": "10", "isDung": false }
//       ],
//       "mucDo": "de",
//       "tags": ["cộng", "toán cơ bản"]
//     },
//     {
//       "noiDung": "Giá trị của đạo hàm hàm số y = x^2 tại x = 3 là?",
//       "dapAn": [
//         { "ma": "A", "noiDung": "3", "isDung": false },
//         { "ma": "B", "noiDung": "6", "isDung": true, "giaiThich": "y' = 2x => y'(3) = 6" },
//         { "ma": "C", "noiDung": "9", "isDung": false },
//         { "ma": "D", "noiDung": "1", "isDung": false }
//       ],
//       "mucDo": "trung_binh",
//       "tags": ["đạo hàm", "giải tích"]
//     }
//   ]
// }
