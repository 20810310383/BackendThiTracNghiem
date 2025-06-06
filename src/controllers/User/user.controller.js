const BoDe = require("../../model/BoDe");
const User = require("../../model/User");

module.exports = {

    getAllUser: async (req, res) => {
        try {
            let filter = {};            

            const deThiList = await User.find(filter)
            console.log("deThiList: ", deThiList);

            res.status(200).json({ data: deThiList, message: "Lấy danh sách user thành công", errCode: 0 });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách user:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    getAllUserWithStats: async (req, res) => {
        try {
            const users = await User.find();

            const stats = await BoDe.aggregate([
                {
                    $group: {
                        _id: "$nguoiTao",
                        totalDeThi: { $sum: 1 },
                        totalLuotThi: { $sum: "$luotThi" }
                    }
                }
            ]);

            // console.log("Stats:", stats);

            //Map vào từng user
            const result = users.map(user => {
                const userStat = stats.find(stat => stat._id && stat._id.toString() === user._id.toString());

                return {
                    _id: user._id,
                    hoTen: user.hoTen,
                    email: user.email,
                    Image: user.Image,
                    vaiTro: user.vaiTro,
                    ngayTao: user.ngayTao,
                    tongBoDe: userStat ? userStat.totalDeThi : 0,
                    tongLuotThi: userStat ? userStat.totalLuotThi : 0
                };
            });

            res.status(200).json({
                data: result,
                message: "Lấy danh sách user và thống kê thành công",
                errCode: 0
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách user + stats:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

}