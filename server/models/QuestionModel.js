var mysql = require('mysql');
var async = require('async');
var config = require('../db/config');

var pool = mysql.createPool(config.mysql);
pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment=1');
});

module.exports = {
    /**
     * 提问
     * title 标题
     * tag 标签
     * content 内容
     */
    askQuestion(req,res){
        let data = {
            code:200,
            msg:'success'
        };

        let body = req.body;
        let title = body.title;
        let tag = body.tag;
        let content = body.content;
        let user_id = req.session.sessionID;
        // 验证
        if(title == '' || tag == '' || content==''){
            data.code = 400;
            data.msg = '请填写完整问题信息';
            res.send(data);
            return;
        }
        
        let askSql = 'insert questions(q_id,q_title,q_tag,q_content,user_id) values(null,?,?,?,?)';
        let param = [title,tag,content,user_id];
      
        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误';
                res.send(data);
                return;
            }

            conn.query(askSql,param,(err)=>{
                if(err){
                    data.code = 400;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                res.send(data);
            });
            conn.release();
        });
    },

    /**
     * 获取问题列表
     * page 当前页
     * pageSize 分页大小
     */
    questionList(req,res){
        let data = {
            code:200,
            msg: 'success',
            data:''
        };

        let page = req.query.page ;
        let pageSize = req.query.pageSize;
        
        let params = [(page-1)*pageSize, parseInt(pageSize)];     // 注意字符串转成数字,否则sql无法报错
        // 查询当前页
        let queSql = 'SELECT q_id,q_title questionTitle,q_tag tagName,votes,answer,views,u.username AS lastRespondent FROM questions AS q INNER JOIN user AS u ON q.user_id = u.uid ORDER BY q.create_time DESC limit ?,?';

        // 查询问题总条数
        let countSql = 'select count(*) as total from questions';

        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误,请稍候重试';
                res.send(data);
                return;
            }

            async.series([
                // 查询问题总条数
                function(callback){
                    conn.query(countSql,[],(err,rs)=>{
                        let total = rs[0].total;
                        callback(null,total);
                    });
                },

                // 查询当前页
                function(callback){
                    conn.query(queSql,params,(err,rs)=>{
                        // 转换tagName
                        if(rs != undefined && rs.length>0){
                            rs.forEach((e)=>{
                                e.tagName = e.tagName.split(',');
                            });
                            callback(null,rs);
                        }else {
                            // 无数据
                            callback(null,'');
                        }
                    });
                }
            ],
            function(err,result){
                if(err){
                    data.code = 400;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                
                data.total = result[0];
                data.data = result[1];
                res.send(data);
            });
            conn.release();
        });
    },

    /**
     * 获取问题详情
     * @qid 问题id
     */
    questionDetail(req,res){
        let data = {
            code:200,
            message: 'sucess',
            data:''
        };
        
        // 查看问题详情
        let queSql = 'select q.q_title as title, q.q_content as content,u.username, q.q_tag as tags, q.votes as totalVotes, q.create_time, q.last_res_time,q.last_res_id from questions as q inner join user as u on q.user_id = u.uid where q_id=?';
        let param = req.query.q_id;

        // views+1
        let uptSql = ' update questions set views=views+1 where q_id = ?';

        // 回答总数
        let answerCountSql = 'select count(*) from answers where q_id = ?';

        // 回答列表
        let answerSql = 'select a_id as answerId,u.username, a_content as answer, a.create_time as createTime,votes from answers as a INNER JOIN user as u on a.u_id = u.uid where q_id = ?';

        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = '连接错误';
                res.send(data);
                return;
            }
            async.series([
                // 查看问题详情
                function(callback){
                    conn.query(queSql,param,(err,rs)=>{
                        let result = rs[0];
                        result.content = result.content.toString(); 
                        callback(null,result);
                    });
                },
                // views+1
                function(callback){
                    conn.query(uptSql,param,(err,rs)=>{
                        callback(null,rs);
                    }); 
                    
                },
                // 回答总数

                // 回答列表
                function(callback){
                    conn.query(answerSql,param,(err,rs)=>{
                        callback(null,rs);
                    });
                }

            ],
            function(err,rs){
                if(err){
                    data.code = 401;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                let result = {};
                result.questionDetail = rs[0];
                result.answerList = rs[2];
                data.data = result;
                res.send(data);
            });
            conn.release();
        });
    },


    /**
     * 撰写答案
     */
    answer(req,res){
        let data = {
            code: 200,
            msg: 'success',
            data: ''
        };

        let uid = req.session.sessionID;
        let q_id = parseInt(req.body.q_id);
        let a_content = req.body.content;
        // 写答案
        let answerSql = 'insert answers(u_id,q_id,a_content) values(?,?,?)';
        let anserParam = [uid,q_id,a_content];

        // question表answer+1
        let uptSql = 'update questions set answer=answer+1 where q_id = ?';
        let queParam =[q_id];
        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = err.message;
                res.send(data);
                return;
            }
            async.series([
                function(callback){
                    // 写入答案
                    conn.query(answerSql,anserParam,(err,rs)=>{
                        callback(null,rs);
                    });
                },
                function(callback){
                    // question表answer+1
                    conn.query(uptSql,queParam,(err,rs)=>{
                        callback(null,'success');
                    });
                }
            ],
            function(err){
                if(err){
                    data.code = 401;
                    data.msg = err.message;
                    res.send(data);
                    return;
                }
                res.send(data);
            });
            conn.release();
        });
    },

    /**
     * 问题/答案投票
     * method POST
     * @ type 0:问题; 1:答案
     * @ vote 1: 赞成; -1: 反对;
     * @ q_id 问题id
     * @ a_id 答案id
     * 
     */
    vote(req,res){
        let data = {
            code: 200,
            msg: 'success',
            data: ''
        };
        let uid = req.session.sessionID; 
        let type = req.body.type;   
        let qid = req.body.q_id;   
        let aid = req.body.a_id;   
        let vote = req.body.vote ;
        
        // 查询用户已赞的问题/回答
        let selectQueSql = 'select vote_questions from user where uid = ?';
        let selectAnswerSql = 'select vote_answers from user where uid = ?';

        // 更新用户已赞的问题/回答
        let uptQueSql = 'update user set vote_questions = ? where uid = ?';
        let uptAnswerSql = 'update user set vote_answers = ? where uid = ?';

        // 更新问题/答案得票总数
        let uptVotesSql = 'update questions set votes= votes+? where q_id = ?';
        let uptAnswerVotesSql = 'update answers set votes= votes+? where a_id = ?';

        pool.getConnection((err,conn)=>{
            if(err){
                data.code = 401;
                data.msg = err.message;
                res.send(data);
                return;
            }
            if(type == 0){     // vote_questions 对问题投票
                async.waterfall([
                    // 查看该用户已投过票的所有问题id
                    function(callback) {
                        conn.query(selectQueSql,[uid],(err,rs)=>{
                            let result = rs[0].vote_questions;
                            callback(null, result);
                        });
                    },
                    // 投票
                    function(rs, callback) {
                        let hasVoted = false; 
                        // votes_questions 不为空
                        if(rs){
                            let votes = rs.split(',');
                            // 遍历数组votes 如果 qid 不在其中 则添加 否则 给已赞的提示
                      
                            for(let i=0; i<votes.length; i++){
                                if (votes[i] == qid) {
                                    hasVoted = true;
                                    break;
                                }
                            }
                            if(hasVoted){
                                // 已投票 不能重复投
                                data.code = 400;
                                data.msg = '您已投票,不能重复投票';
                                callback(null,hasVoted,qid);
                            }else {
                                // 投票
                                votes.push(qid);
                                let uptVotes = votes.join();
                                conn.query(uptQueSql,[uptVotes,uid],(err,rs)=>{
                                    callback(null, hasVoted,qid);
                                });
                            }
                        }
                        // votes_questions 为空
                        else {
                            conn.query(uptQueSql,[qid,uid],(err,rs)=>{
                                callback(null, hasVoted,qid);
                            });
                        }
                    },
                    // 更新问题票数
                    function(hasVoted,qid,callback){
                        if(hasVoted){
                            callback(null,'该问题已投票,不能重复');
                        }else {
                            conn.query(uptVotesSql,[vote,qid],(err,rs)=>{
                                callback(null,'投票成功');
                            });
                        }
                        
                    }
                    
                ], 
                function (err,result) {
                    if(err){
                        data.code = 401;
                        data.msg = err.message;
                        res.send(data);
                        return;
                    }
                    res.send(data);
                });
                conn.release();
            }
            // vote_answers 对答案投票
            else if(type == 1){ 
                async.waterfall([
                    // 查看该用户已投过票的所有答案id
                    function(callback) {
                        conn.query(selectAnswerSql,[uid],(err,rs)=>{
                            let result = rs[0].vote_answers;
                            callback(null, result);
                        });
                    },
                    // 投票
                    function(rs,callback) {
                        // vote_answers 不为空
                        let hasVoted = false;
                        if(rs){
                            let votes = rs.split(',');
                            // 遍历数组votes 如果 qid 不在其中 则添加 否则 给已赞的提示
                            for(let i=0; i<votes.length; i++){
                                if (votes[i] == aid) {
                                    hasVoted = true;
                                    break;
                                }
                            }
                            if(hasVoted){
                                // 已投票 不能重复投
                                data.code = 400;
                                data.msg = '您已投票,不能重复投票';
                                callback(null,hasVoted,aid);
                            }else {
                                // 投票
                                votes.push(aid);
                                let uptVotes = votes.join();
                                conn.query(uptAnswerSql,[uptVotes,uid],(err,rs)=>{
                                    callback(null, hasVoted,aid);
                                });
                            }
                        }
                        // vote_answers 为空
                        else {
                            conn.query(uptAnswerSql,[aid,uid],(err,rs)=>{
                                callback(null, hasVoted,aid);
                            });
                        }
                    },
                    // 更新答案获得的票数
                    function(hasVoted,qid,callback){
                        if(hasVoted){
                            callback(null,'该问题已投票,不能重复');
                        }else {
                            conn.query(uptAnswerVotesSql,[vote,aid],(err,rs)=>{
                                callback(null,'投票成功');
                            });
                        }
                    }
                ], 
                function (err, result) {
                    if(err){
                        data.code = 401;
                        data.msg = err.message;
                        res.send(data);
                        return;
                    }
                    res.send(data);
                });
                conn.release();
            }
            
        });

    }
   
};