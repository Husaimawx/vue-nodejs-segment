<template>
    <!-- 答案列表 -->
  <div class="answer">
        <hr>
        <h3 class="title">撰写答案</h3>
        <div class="rich-text-wrapper clearfix">
            <quill-editor v-model="content" 
                ref="myQuillEditor"
                :options="editorOption"
                @focus="onEditorFocus($event)"
                >
            </quill-editor>
        </div>
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'
export default {
    data(){
        return {
            editorOption: {
                // some quill options
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
            },
            content:''
        }
    },

    methods:{
        // 编辑器获取焦点
        onEditorFocus(event){

        }
    }

}
</script>

<style lang="less" scoped>
    @import url(../../../assets/css/mixin.less);
    
    .answer {
        width: 762px;
        margin-left: 65px;
        margin-bottom:20px;    
        .title {
            font-size: 18px;
            margin:20px 0 18px;
        }

        .rich-text-wrapper{
            // 富文本编辑器
            .quill-editor {
                height: 300px;
            }
        }
    }
</style>


