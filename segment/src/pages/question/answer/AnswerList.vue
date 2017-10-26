<template>
    <ul class="answer-list">
        <li class="title">
            {{answerList.length}}个回答
        </li>
        <li class="answer-wrapper" v-for="(item,index) in answerList" :key='index'>
            <div class="votes">
                <span class="up" @click='likeAnswer(item.answerId)'></span>
                <br>
                <span class="num">{{item.votes}}</span>
                <br>
                <span class="down" @click='disLikeAnswer(item.answerId)'></span>
            </div>
            <!-- 答案详情 -->
            <div class="ql-editor" v-html="item.answer"></div>
            <div class="author">
                <img src="" alt="">
                <span>{{item.username}}</span>
                <span>{{item.createTime | formatTime}}前回答</span>
            </div>
        </li>
    </ul>
</template>
<script>
import { VOTE } from '@/api/api'

export default {
    props: ['answerList'],
    filters:{
        formatTime(val){
            let create_time = new Date(val);
            let now = new Date();
            let sec = (now - create_time)/1000;    // 转换为s
            let min = sec/60;
            let hour = min/60;
            let day = hour/24
            let mounth = day/30 
            let year = mounth/12
            let time;

            if(Math.round(min) < 1){
                time = Math.round(sec)+'秒'
            }
            else if(Math.round(hour) < 1){
                time = Math.round(min) + '分钟'
            }
            else if(Math.round(day)< 1){
                time = Math.round(hour) + '小时'
            }
            else if(Math.round(mounth)<1){
                time = Math.round(day) + '天'
            }
            else if (Math.round(year)<1){
                time = Math.round(mounth) + '月'
            }else {
                time = Math.round(year) + '年'
            }
            return time
        }
    },
    methods:{
        // 投票赞成
        likeAnswer(answerId){
            let param = {
               type: 1,     // 0:question, 1: answer
               vote: 1,     // 1:赞成
               a_id: answerId
           }
           VOTE(param).then(res=>{
               console.log(res)
               if(res.data.code == 200){
                   this.$emit('refreshVotes')
               }
           })
        },
        
        // 投票反对
        disLikeAnswer(answerId){
            let param = {
               type: 1,     // 0:question, 1: answer
               vote: -1,     // 1:赞成
               a_id: answerId
           }
           VOTE(param).then(res=>{
               if(res.data.code == 200){
                   // 成功后更新votes
                   this.$emit('refreshVotes')
               }
           })
        }
    }
}
</script>

<style lang="less" scoped>
    @import url(../../../assets/css/mixin.less);

    // 答案列表
    .answer-list {
        width: 827px;
        margin-bottom:20px; 
        
        // title
        .title {
            font-size: 20px;
            padding: 36px 0 15px;
            border-bottom: 2px solid #ccc;
        }

        // 答案
        .answer-wrapper{
            padding:20px 0 30px;
            border-bottom: 1px solid #ccc;

            // 投票
            .votes{
                margin-right: 20px;
                display: inline-block;
                width:40px;
                height: 55px;
                background-color: #f3f3f3;
                text-align: center;
                font-size: 0;
                border-radius: 3px;
                box-sizing: border-box;
                padding:5px;
                vertical-align: top;

                &:hover {
                    background-color: #fff7e2;
                }


                .num {
                    font-size: 18px;
                    line-height: 22px;
                }

                // 箭头
                .up,
                .down {
                    display: inline-block;
                    border:7px solid transparent;
                    border-radius: 2px;
                    cursor: pointer;

                    
                }
                .up{
                    margin-top:-5px;
                    border-bottom: 10px solid #577575;

                    &:hover{
                        border-bottom-color: #f6a623;
                    }
                    
                }
                .down {
                    border-top: 10px solid #577575;

                    &:hover{
                        border-top-color: #f6a623;
                    }
                }
            }

            // 富文本编辑器
            .ql-editor{
                display: inline-block;
                width: 762px;
                margin:0;
                padding:0;
            }

            .author {
                padding-left: 60px;
                color: @gray-l;
                margin-top: 30px;
            }
        }


    }
</style>

