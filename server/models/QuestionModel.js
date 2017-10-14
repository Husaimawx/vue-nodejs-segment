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
     * todo/回答列表
     */
    questionDetail(req,res){
        let data = {
            code:200,
            message: 'sucess',
            data:''
        };
        
        // 查看问题详情
        let queSql = 'select q.q_title as title, q.q_content as content,u.username, q.q_tag as tags, q.create_time, q.last_res_time,q.last_res_id from questions as q inner join user as u on q.user_id = u.uid where q_id=?';
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
    } 

};