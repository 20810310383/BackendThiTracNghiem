const BoDe = require("../../model/BoDe");
const KetQuaThi = require("../../model/KetQuaThi");
require('dotenv').config();
// Secret key cho JWT
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.luuKetQuaThi = async (req, res) => {
  try {
    const { boDeId, dapAnDaChon, thoiGianLam, emailUser } = req.body;
    // const nguoiDungId = req.user._id || req.user.id || req.body._idUser; // lấy từ token xác thực
    const nguoiDungId = req.body._idUser; // lấy từ token xác thực

    const boDe = await BoDe.findById(boDeId);
    if (!boDe) return res.status(404).json({ message: 'Bộ đề không tồn tại.' });

    let soCauDung = 0;
    const chiTiet = [];

    // Duyệt từng câu hỏi trong bộ đề
    boDe.cauHoi.forEach((cauHoi) => {
        const luaChon = dapAnDaChon.find(d => d.cauHoiId === cauHoi._id.toString());        
        const dapAnDung = cauHoi.dapAn.find(d => d.isDung === true);
        const dapAnChonObj = luaChon
        ? {
            ma: luaChon.dapAnChon,
            noiDung: cauHoi.dapAn.find(d => d.ma === luaChon.dapAnChon)?.noiDung || ''
            }
        : {
            ma: '',
            noiDung: 'Không chọn đáp án'
            };

        const isDung = luaChon ? luaChon.dapAnChon === dapAnDung?.ma : false;

        chiTiet.push({
            cauHoiId: cauHoi._id,
            cauHoiNoiDung: cauHoi.noiDung,
            dapAnChon: dapAnChonObj,
            dapAnDung: {
                ma: dapAnDung?.ma,
                noiDung: dapAnDung?.noiDung || ''
            },
            isDung
        });

        if (isDung) soCauDung++;

    });

    const soCauSai = boDe.cauHoi.length - soCauDung;
    const diem = +(10 * soCauDung / boDe.cauHoi.length).toFixed(2);

    const ketQua = new KetQuaThi({
      nguoiDung: nguoiDungId,
      boDe: boDeId,
      soCauDung,
      soCauSai,
      diem,
      thoiGianLam,
      chiTiet
    });

    await ketQua.save();

    // 📨 Gửi email
    if (emailUser) {
        let emailContent = `
            <div style="max-width: 700px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); padding: 30px;">
            <h2 style="text-align: center; color: #1890ff; border-bottom: 2px solid #e6f7ff; padding-bottom: 10px;">
                ✅ KẾT QUẢ BÀI THI: ${boDe.ten}
            </h2>

            <div style="font-size: 16px; line-height: 1.6; color: #333;">
                <p><strong>📌 Điểm:</strong> <span style="font-size: 20px; font-weight: bold; color: #f5222d;">${diem}/10</span></p>
                <p><strong>⏱️ Thời gian làm bài:</strong> ${thoiGianLam} phút</p>
                <p><strong>✅ Số câu đúng:</strong> ${soCauDung} / ${boDe.cauHoi.length}</p>
            </div>

            <hr style="margin: 24px 0; border-top: 1px dashed #d9d9d9;" />

            <h3 style="color: #13c2c2; margin-bottom: 16px;">📋 Chi tiết từng câu hỏi:</h3>
            <ol style="padding-left: 18px;">
        `;

        chiTiet.forEach((cau, idx) => {
            const background = cau.isDung ? '#f6ffed' : '#fff1f0';
            const border = cau.isDung ? '#b7eb8f' : '#ffa39e';

            emailContent += `
                <li style="margin-bottom: 16px; background: ${background}; border-left: 4px solid ${border}; padding: 12px; border-radius: 6px;">
                <p><strong>📝 Câu hỏi:</strong> ${cau.cauHoiNoiDung}</p>
                ${
                    cau.dapAnChon?.ma
                    ? `
                    <p>
                    <strong>🔸 Đáp án bạn chọn:</strong> 
                    <span style="color: ${cau.isDung ? 'green' : 'red'}; font-weight: bold;">
                        ${cau.dapAnChon.ma}. ${cau.dapAnChon.noiDung}
                        ${cau.isDung ? ' ✅ Đúng' : ' ❌ Sai'}
                    </span>
                    </p>
                    <p><strong>✔️ Đáp án đúng:</strong> ${cau.dapAnDung.ma}. ${cau.dapAnDung.noiDung}</p>
                `
                    : `
                    <p style="color: orange;"><strong>⚠️ Bạn chưa chọn đáp án cho câu hỏi này.</strong></p>
                `
                }
                </li>
            `;
        });


        emailContent += `
            </ol>
            <p style="text-align: center; font-size: 14px; color: #888; margin-top: 40px;">
                Cảm ơn bạn đã tham gia bài thi cùng <strong>KTQuiz</strong> 💙
            </p>
            </div>
        `;

        await transporter.sendMail({
            from: `"KTQuiz" <${process.env.EMAIL_USER}>`,
            to: emailUser,
            subject: `📨 Kết quả bài thi: ${boDe.ten}`,
            html: emailContent,
        });
    }


    res.status(201).json({
      message: 'Lưu kết quả thành công',
      ketQua
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.layKetQuaTheoBoDe = async (req, res) => {
  try {
    const { idBoDe } = req.query;

    if (!idBoDe) {
      return res.status(400).json({ message: 'Thiếu id bộ đề' });
    }

    const ketQua = await KetQuaThi.find({ boDe: idBoDe })
      .populate('nguoiDung') // lấy thêm tên, email người thi
      .populate('boDe') // lấy tên bộ đề nếu cần
      .sort({ ngayThi: -1 });

    return res.status(200).json({
      message: 'Lấy danh sách kết quả thành công',
      data: ketQua
    });
  } catch (error) {
    console.error('Lỗi lấy kết quả theo bộ đề:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
