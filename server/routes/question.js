var express = require('express');
// 接收form表单提交
var multer  = require('multer');
// var upload = multer({ dest: 'uploads/' });  // 文件保存在uploads文件夹下 存储格式为二进制 且文件名随机rename

var router = express.Router();
var QuestionModel = require('../models/QuestionModel');
var checkSession = require('../session/CheckSession'); 

// 设置图片文件储存地址
var storage = multer.diskStorage({
    //uploads文件夹需手动在跟目录下创建
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split('.');
        cb(null, file.fieldname + '-' + Date.now() + '.' + fileFormat[fileFormat.length - 1]);
    }
});
var upload = multer({ storage: storage });


//=============================================
// 提问
router.post('/ask_question',(req,res)=>{
    //验证session
    let result = checkSession.check(req);
    if (result.code == 402) {
        res.send(result);
        return;
    }
    QuestionModel.askQuestion(req,res);
});

// 获取问题列表
router.get('/question_list',(req,res)=>{
    QuestionModel.questionList(req,res);
});

// 查看问题详情
router.get('/question_detail',(req,res)=>{
    QuestionModel.questionDetail(req,res);
});

// 回答问题 撰写答案
router.post('/answer',(req,res)=>{
    // 验证session
    let result = checkSession.check(req);
    if (result.code == 402) {
        res.send(result);
        return;
    }
    QuestionModel.answer(req,res);
});

//================
// 保存上传的图片
router.post('/upload',upload.single('logo'),function(req,res,next){
    var path = req.file.path;   // 文件路径
    let body = req.body;
    let file = req.file;
    let flash = req.flash;
    // QuestionModel.upload(req,res);
    res.end(path);
});

router.post('/pic',function(req,res){
    console.log(req.body);
    let file = req.body;
    res.end('suc'); // 能接收到
});
module.exports = router;