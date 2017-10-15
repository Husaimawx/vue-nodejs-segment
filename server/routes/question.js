var express = require('express');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });  // 文件保存在uploads文件夹下

var router = express.Router();
var QuestionModel = require('../models/QuestionModel');
var checkSession = require('../session/CheckSession'); 

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


router.post('/upload',upload.single('logo'),function(req,res,next){
// router.post('/upload',(req,res)=>{
    var path = req.file.originalname;
    let body = req.body;
    let file = req.file;
    let flash = req.flash;
    QuestionModel.upload(req,res);
});
module.exports = router;