<template>
  <div class="container">
    <el-dialog title="文章预览" :visible.sync="dialogVisible" width="30%" @close="dialogClosed">
      <h4 class="title">{{ currentArticle.title }}</h4>
      <div class="sub-title clearfix">
        <span>{{ currentArticle.createTime | parseTimeByString }}</span>
        <span>{{ currentArticle.username }}</span>
        <i class="el-icon-view"></i>
        <span>{{ currentArticle.visits }}</span>
      </div>
      <div class="content" v-html="currentArticle.articleBody"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">返回</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { detail as articleDetail } from '@/api/hmmm/articles.js'
import { detail as userDetail } from '@/api/base/users.js'
export default {
  name: 'ArticlePreview',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  created() {
    this.viewArticle()
  },
  data() {
    return {
      currentArticle: {},
      dialogVisible: false
    }
  },
  methods: {
    async viewArticle() {
      try {
        const { data: res } = await articleDetail({ id: this.id })
        console.log(res)
        const { data: user } = await userDetail({ id: res.creatorID })
        console.log(user)
        res.username = user.username
        this.currentArticle = res
        this.dialogVisible = true
      } catch (err) {
        console.log('获取文章详情失败！')
        this.$message.error('获取文章详情失败！')
        this.$emit('close')
      }
    },
    dialogClosed() {
      this.currentArticle = {}
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang='less'>
.clearfix::after {
  content: '';
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
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
      .title {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 24px;
      }
      .sub-title {
        margin-bottom: 10px;
        span {
          float: left;
          margin-right: 10px;
        }
        i {
          float: left;
          margin-right: 10px;
          transform: translateY(1px);
        }
      }
      .content {
        padding: 5px 20px;
        // margin-bottom: 20px;
        background-color: #f5f5f5;
        p {
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
