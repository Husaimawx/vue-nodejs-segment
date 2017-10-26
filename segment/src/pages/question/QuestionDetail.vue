<template>
    <div class="question-detail">
        <div class="question-title">
            <span class="icon">问</span>
            <p class="title">{{questionTitle}}</p>
            <div class="tag-user">
                <ul class="tag">
                    <li class="tag-item" v-for="(item,index) in tags" :key='index'>{{item}}</li>
                </ul>
                <span class="user">{{username}}</span>
                <span class="time">{{time}}前提问</span>
            </div>
        </div>
        <hr>
        <!-- 问题详情外层包裹 -->
        <div class="question-wrapper">
            <div class="votes">
                <span class="up" @click="likeQue"></span>
                <br>
                <span class="num">{{votes}}</span>
                <br>
                <span class="down" @click='disLikeQue'></span>
            </div>
            <!-- 问题详情 -->
            <div class="ql-editor" v-html="questionDetail"></div>
        </div>

        <!-- 答案列表 -->
        <answer-list v-if='answerList.length > 0' :answerList = 'answerList' @refreshVotes='getQueDetail'></answer-list>

        <!-- 回答问题 -->
        <answer></answer>
    </div>
</template>
<script>
import answer from './answer/Answer'
import answerList from './answer/AnswerList'
import { quillEditor } from 'vue-quill-editor'
import { QUESTION_DETAIL, VOTE } from '@/api/api'

export default {
    components:{
        answer,
        answerList
    },

    data(){
        return {
            questionTitle:'',
            username:'',
            time: '',
            tags:[],
            userId:'',
            questionDetail:"", 
            q_id:0,
            content:"",
            votes:0,
            answerList:[],
            editorOption: {
                modules: {
                    toolbar: [
                        [{ 'size': ['small', false, 'large'] }],
                        ['bold', 'italic'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image']
                    ],
                    history: {
                        delay: 1000,
                        maxStack: 50,
                        userOnly: false
                    }
                },
                placeholder:' '
            }
        }
    },
    methods:{
        // 获取问题详情/回答列表
        getQueDetail(){
            let para = {
                q_id: this.q_id
            }
            QUESTION_DETAIL(para).then(res=>{
                let data  = res.data
                if(data.code === 200){
                    this.answerList = data.data.answerList

                    this.questionTitle = data.data.questionDetail.title
                    this.questionDetail = data.data.questionDetail.content
                    this.username = data.data.questionDetail.username
                    this.tags = data.data.questionDetail.tags.split(',')
                    this.votes = data.data.questionDetail.totalVotes

                    let time = data.data.questionDetail.create_time
                    // 格式化提问时间
                    let createTime = new Date(time);
                    this.time = this.formatTime(createTime)
                }
            })    
        },

        // 格式化时间
        formatTime(createTime){
            let now = new Date();
            let sec = (now - createTime)/1000;
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
        },

        // 投票赞成
        likeQue(){
           let param = {
               type: 0,     // 0:question, 1: answer
               vote: 1,     // 1:赞成
               q_id: this.q_id
           }
           VOTE(param).then(res=>{
               if(res.data.code == 200){
                   this.getQueDetail()
               }
           })

        },

        // 投票反对
        disLikeQue(){
            let param = {
                type: 0,     // 0:question, 1: answer
                vote: -1,    // -1: 反对
                q_id: this.q_id
            }
            VOTE(param).then(res=>{
                if(res.data.code == 200){
                    this.getQueDetail()
                }
            })
        }
    },
    mounted(){
        this.getQueDetail();
    },
    created(){
        this.q_id = this.$route.params.q_id
    }
}
</script>
<style lang="less" scoped>
    @import url(../../assets/css/mixin.less);
    .question-detail {
        width: 1116px;
        margin:29px auto 0;
        font-size: 14px;
        text-align: left;

        // 问题标题
        .question-title {
            // 图标
            .icon {
                display: inline-block;
                width:30px;
                height: 30px;
                line-height: 30px;
                font-size:14px;
                text-align: center;
                background-color:#fff;
                color: @green;
                border:1px solid @green;
                box-sizing: border-box;
                border-radius: 50%;
            }

            // 问题标题
            .title {
                display: inline-block;
                font-size: 20px;
                font-weight: 500;
                color: #333;
                margin-left: 10px;
            }

            // 标签/用户
            .tag-user {
                font-size: 12px;
                margin: 15px 0 20px;
                .tag {
                    display: inline-block;
                    .tag-item {
                        display: inline-block;
                        padding: 3px 5px;
                        background-color: #ebf5f3;
                        color:@green;
                        margin-right: 5px;
                    }
                }

                .user {
                    color: @green;
                    font-weight: 600;
                    margin:0 10px;
                    font-size: 16px;
                }

                .time {
                    color:#999;
                }

            }
            
        }

        .question-wrapper{
            // 投票
            .votes{
                margin-right: 24px;
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
            }
        }
    }



</style>


