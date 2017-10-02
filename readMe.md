## express+mysql+vue 前后端分离 仿segment论坛

### segment(前端)
- vue + vue-router + vuex + axios + less   
	```bash
    cd segment  
    npm i
    npm run dev

	```		


### server(服务端)
- express + mysql
	```bash
    cd server
    npm i
    npm start

	```
- mysql config
	```js
	mysql: {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'segment2',
        'port': '3306'
    }
	```	
- API error code
    - 200 success
    - 400 error  
    - 401 连接错误  
    - 402 登录过期



### mysql tables
```mysql

    # 用户表
    CREATE TABLE `user` (
        `uid` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
        `mobile` char(15) DEFAULT NULL,
        `email` varchar(60) DEFAULT NULL,
        `pwd` varchar(60) NOT NULL,
        `username` varchar(120) NOT NULL,
        `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
        `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (`uid`),
        UNIQUE KEY `username_unique` (`username`),
        UNIQUE KEY `email_unique` (`email`),
        UNIQUE KEY `mobile_unique` (`mobile`) USING BTREE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    # 问题表
    create table questions(
        q_id smallint unsigned primary key auto_increment,
        q_title varchar(220) not null,
        q_tag varchar(50) not null,
        q_content longtext not null,
        votes int not null default 0,
        views int unsigned not null default 0,
        answer int unsigned not null default 0,
        last_res_id int unsigned comment '最近回复的用户id',
        create_time timestamp default current_timestamp,
        user_id int not null,
        last_res_time timestamp
    )engine=innodb default charset=utf8;
   

   # 回答表
    create table answers(
        `a_id` int unsigned not null primary key auto_increment comment '回答id',
        `u_id` int unsigned not null comment '用户id',
        `q_id` int unsigned  not null comment '问题id',
        `a_content` longtext not null comment '回答内容',
        `votes` int not null default 0 comment '票数',
        `create_time` timestamp not null default current_timestamp
    )engine=innodb default charset=utf8;

    # 评论表 
    create table comments(
        `c_id` int unsigned primary key auto_increment comment '评论id',
        `a_id` int unsigned not null comment '回答id',
        `c_content` longtext not null comment '评论内容',
        `create_time` timestamp not null default current_timestamp
    )engine=innodb default charset=utf8;
    
```

#### TODO
- *项目持续维护中,有时间就写一些, 尽量做到高度还原segmentfault论坛页面*
- *后续前端部分会进一步配置成响应式页面*
- *有时间的话会尝试用KOA重写服务端*
- *如果觉得还不错 麻烦随手给个start*