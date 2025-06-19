const express = require('express');
const bodyParser = require('body-parser');
const viewEngine = require('./config/viewEngine');
const uploadRouter = require('./routes/uploadRouter');
const connectDB = require('./config/connectDB');
const boDe = require('./routes/bodeRouter'); 
const capHoc = require('./routes/caphocRouter'); 
const monHoc = require('./routes/monhocRouter'); 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aiSuggestRouter = require('./routes/aiSuggest');
const webhookRoute = require('./routes/webhook');

const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const WebSocket = require('ws'); // Thêm thư viện WebSocket
const cleanUploads = require('./utils/cleanUploads');

require("dotenv").config();


let app = express();
let port = process.env.PORT || 6969;
const hostname = process.env.HOST_NAME;

connectDB();

// Cài đặt CORS
const allowedOrigins = [
    'http://localhost:3010', 
    'http://localhost:3011',    
    // 'http://localhost:8081' ,   //app
    'https://thitracnghiem.dokhactu.site',     
    'https://thitracnghiemadmin.dokhactu.site',     
    'https://backendthitracnghiem.dokhactu.site',     
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Dùng includes thay cho indexOf
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,    
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],  // Cho phép phương thức OPTIONS (preflight)
    allowedHeaders: ['Content-Type', 'Authorization', 'upload-type'],
}));
app.options('*', cors()); // Enable preflight requests for all routes



// Config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Đặt thư mục public/uploads làm public để có thể truy cập
app.use('/uploads', express.static(path.join(__dirname, './public/uploads')));
// app.use('/webhook', webhookRoute);s


// Config app
viewEngine(app);

const routes = [  
    { path: '/api/bo-de', router: boDe },
    { path: '/api/cap-hoc', router: capHoc },
    { path: '/api/mon-hoc', router: monHoc },
    { path: '/api/auth', router: authRoutes },
    { path: '/api/user', router: userRoutes },
    { path: '/api/chatgpt', router: aiSuggestRouter },
];
  
routes.forEach(route => app.use(route.path, route.router));

// Sử dụng uploadRouter
app.use("/api/upload", uploadRouter); // Đặt đường dẫn cho upload


app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port, `\n http://localhost:${port}`);
});
