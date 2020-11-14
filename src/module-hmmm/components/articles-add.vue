<template>
  <div class="container">
    <el-dialog :title="id ? '文章修改' : '文章添加'" :visible.sync="dialogVisible" width="30%" @close="dialogClosed">
      <el-form ref="addForm" :model="addForm" label-position="left" label-width="100px" size="medium" :rules="addFormRules" v-loading="loading && id" element-loading-text="拼命加载中">
        <el-form-item label="文章标题：" prop="title">
          <el-input class="w400" v-model.trim="addForm.title" placeholder="请输入文章标签"></el-input>
        </el-form-item>
        <el-form-item label="文章内容：" prop="articleBody" style="margin-bottom: 32px">
          <quill-editor v-model.trim="addForm.articleBody" class="ql-editor" :options="editorOption" @blur="onEditorBlur($event, 'articleBody')"> </quill-editor>
        </el-form-item>
        <el-form-item label="解析视频：" prop="videoURL">
          <el-input class="w400" v-model.trim="addForm.videoURL" placeholder="请输入视频地址"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { detail as articleDetail, add as addArticle, update as updateArticle } from '@/api/hmmm/articles.js'
export default {
  name: 'ArticlesAdd',
  props: {
    id: {
      type: Number,
      required: false
    }
  },
  async created() {
    if (this.id) {
      await this.getArticle()
    }
    this.loading = false
    this.dialogVisible = true
  },
  data() {
    return {
      addForm: {
        id: '',
        title: '',
        articleBody: '',
        videoURL: ''
      },
      addFormRules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        articleBody: [{ required: true, message: '文章内容不能为空', trigger: 'blur' }]
      },
      dialogVisible: false,
      loading: true,
      editorOption: {
        placeholder: 'fuck quill editor',
        content: null,
        modules: {
          toolbar: [['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote'], ['code-block', 'image', 'link']]
        }
      }
    }
  },
  methods: {
    async getArticle() {
      try {
        const { data: res } = await articleDetail({ id: this.id })
        this.addForm.id = res.id
        this.addForm.title = res.title
        this.addForm.articleBody = res.articleBody
        this.addForm.videoURL = res.videoURL
        console.log(this.addForm)
      } catch (err) {
        console.log('获取文章详情失败！')
        this.$message.error('获取文章详情失败！')
        this.$emit('close')
      }
    },
    submitForm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          const formCopy = {}
          for (const key in this.addForm) {
            if (this.addForm[key]) {
              formCopy[key] = this.addForm[key]
            }
          }
          console.log(formCopy)
          try {
            if (this.id) {
              await updateArticle(formCopy)
              this.$message.success('文章修改成功！')
            } else {
              await addArticle(formCopy)
              this.$message.success('文章创建成功！')
            }
            this.$emit('close')
          } catch (err) {
            console.log(err)
            this.$message.error('提交失败！')
          }
        } else {
          this.$message.error('数据不完整！')
          return false
        }
      })
    },
    onEditorBlur(event, field) {
      this.$refs.addForm.validateField(field)
    },
    dialogClosed() {
      this.addForm = {}
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  /deep/.el-dialog {
    width: 800px !important;
    .el-dialog__header {
      display: flex;
      height: 50px;
      padding: 10px;
      color: #fff;
      background-color: #46a0fc;
      justify-content: space-between;
      /deep/.el-dialog__title {
        font-size: 18px;
        line-height: 30px;
      }
      /deep/.el-dialog__headerbtn {
        top: 15px;
        right: 15px;
        font-size: 20px;
        line-height: 20px;
      }
    }
    .el-dialog__body {
      padding: 20px;
    }
  }
  .ql-editor {
    padding: 0;
    margin-top: -10px;
    /deep/.ql-container {
      height: 300px;
    }
  }
}
</style>
