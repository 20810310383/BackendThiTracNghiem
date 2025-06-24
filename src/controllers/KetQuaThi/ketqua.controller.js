const BoDe = require("../../model/BoDe");
const KetQuaThi = require("../../model/KetQuaThi");
require('dotenv').config();
// Secret key cho JWT
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Types} = require('mongoose');
const mongoose = require('mongoose');
const User = require("../../model/User");
const { log } = require("console");


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

    await BoDe.findByIdAndUpdate(boDeId, { $inc: { luotThi: 1 } });

    let soCauDung = 0;
    const chiTiet = [];

    // Duyệt từng câu hỏi trong bộ đề
    boDe.cauHoi.forEach((cauHoi) => {
        console.log("cauhoi: ", cauHoi);
        
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
            ImageNoiDung: cauHoi.ImageNoiDung,
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
                <p><strong>📝 Câu hỏi:</strong> ${cau.cauHoiNoiDung}</p> <br/>
                ${cau.ImageNoiDung ? `<img src="${cau.ImageNoiDung}" style="height: 100px;" />` : ""}
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

exports.layKetQuaTheoBoDe1 = async (req, res) => {
  try {
    const { idBoDe, search, ngayThi } = req.query;

    if (!idBoDe) {
      return res.status(400).json({ message: 'Thiếu id bộ đề' });
    }

    const query = { boDe: idBoDe };

    // 📌 Nếu có ngày thi
    if (ngayThi) {
        const date = new Date(ngayThi); // "2025-06-22"

        const start = new Date(date);
        const end = new Date(date);

        // Cộng 1 ngày để lấy đúng mốc giờ Việt Nam (UTC+7)
        start.setDate(start.getDate() - 1);
        start.setHours(17, 0, 0, 0); // 00:00 VN = 17:00 hôm trước UTC

        end.setHours(17, 0, 0, 0);   // 00:00 hôm sau VN = 17:00 hôm đó UTC

        query.ngayThi = { $gte: start, $lt: end };
    }



    // 📌 Nếu có từ khóa tìm kiếm (search hoTen hoặc email)
    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { hoTen: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchedUsers.map(user => user._id);
      query.nguoiDung = { $in: userIds };
    }

    // 📌 Truy vấn kết quả
    const ketQua = await KetQuaThi.find(query)
      .populate('nguoiDung')
      .populate('boDe')
      .sort({ ngayThi: -1 });

    return res.status(200).json({
      message: 'Lấy danh sách kết quả thành công',
      data: ketQua,
    });
  } catch (error) {
    console.error('Lỗi lấy kết quả theo bộ đề:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.layKetQuaTheoBoDe = async (req, res) => {
  try {
    const { idBoDe, search, ngayThi, page = 1, limit = 10 } = req.query;

    if (!idBoDe) {
      return res.status(400).json({ message: 'Thiếu id bộ đề' });
    }

    const query = { boDe: idBoDe };

    // 📌 Nếu có ngày thi (theo giờ VN)
    if (ngayThi) {
      const date = new Date(ngayThi);

      const start = new Date(date);
      const end = new Date(date);

      start.setDate(start.getDate() - 1);
      start.setHours(17, 0, 0, 0);

      end.setHours(17, 0, 0, 0);

      query.ngayThi = { $gte: start, $lt: end };
    }

    // 📌 Nếu có từ khóa tìm kiếm
    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { hoTen: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchedUsers.map((user) => user._id);
      query.nguoiDung = { $in: userIds };
    }

    // Tính số lượng tổng
    const total = await KetQuaThi.countDocuments(query);

    // 📌 Truy vấn kết quả có phân trang
    const ketQua = await KetQuaThi.find(query)
      .populate('nguoiDung')
      .populate('boDe')
      .sort({ ngayThi: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return res.status(200).json({
      message: 'Lấy danh sách kết quả thành công',
      data: ketQua,
      pagination: {
        total,
        current: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi lấy kết quả theo bộ đề:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.layKetQuaTheoUser = async (req, res) => {
  try {
    const { userId, search, ngayThi, page = 1, limit = 10 } = req.query;

    const query = {};

    // 📌 Nếu lọc theo người dùng
    if (userId) {
      query.nguoiDung = userId;
    }

    // 📌 Nếu có ngày thi (giờ VN = UTC+7)
    if (ngayThi) {
      const date = new Date(ngayThi);

      const start = new Date(date);
      const end = new Date(date);

      start.setDate(start.getDate() - 1);
      start.setHours(17, 0, 0, 0);

      end.setHours(17, 0, 0, 0);

      query.ngayThi = { $gte: start, $lt: end };
    }

    // 📌 Truy vấn cơ bản theo người dùng + ngày thi
    const ketQuaRaw = await KetQuaThi.find(query)
      .populate('nguoiDung')
      .populate('boDe')
      .sort({ ngayThi: -1 });

    // 📌 Nếu có tìm kiếm theo tên bộ đề
    const ketQuaFiltered = search
      ? ketQuaRaw.filter(kq =>
          kq.boDe?.ten?.toLowerCase().includes(search.toLowerCase())
        )
      : ketQuaRaw;

    // 📌 Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const ketQuaPage = ketQuaFiltered.slice(startIndex, startIndex + parseInt(limit));

    return res.status(200).json({
      message: 'Lấy danh sách kết quả thành công',
      data: ketQuaPage,
      pagination: {
        total: ketQuaFiltered.length,
        current: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(ketQuaFiltered.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Lỗi lấy kết quả theo user:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

