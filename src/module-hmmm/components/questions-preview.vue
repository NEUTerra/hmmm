<template>
  <div class="container">
    <el-dialog title="题目预览" :visible.sync="viewDialogVisible" width="30%" @close="viewDialogClosed">
      <el-row>
        <el-col :span="6"> 【题型】：{{ currentQuestion.questionType | parseQuestionType }} </el-col>
        <el-col :span="6"> 【编号】：{{ currentQuestion.id }} </el-col>
        <el-col :span="6"> 【难度】：{{ currentQuestion.difficulty | parseQuestionType }} </el-col>
        <el-col :span="6"> 【标签】：{{ currentQuestion.tags }} </el-col>
      </el-row>
      <el-row>
        <el-col :span="6"> 【学科】：{{ currentQuestion.subjectName }} </el-col>
        <el-col :span="6"> 【目录】：{{ currentQuestion.catalogName }} </el-col>
        <el-col :span="6"> 【方向】：{{ currentQuestion.direction }} </el-col>
      </el-row>
      <el-divider></el-divider>
      <el-row>【题干】： </el-row>
      <el-row v-html="currentQuestion.question" style="color: #8f8fff"></el-row>
      <el-divider></el-divider>
      <el-row>【参考答案】：（注：以下选项按钮虽然没有disabled但是你仍然选不了哦）</el-row>
      <div v-if="currentQuestion.options">
        <div v-if="currentQuestion.isMultiple">
          <el-row>多选题，以下选中的为正确答案</el-row>
          <el-row v-for="item in currentQuestion.options" :key="item.id">
            <el-checkbox :value="currentQuestion.correct" :label="item.title"></el-checkbox>
          </el-row>
        </div>
        <div v-else>
          <el-row>单选题，以下选中的为正确答案</el-row>
          <el-row v-for="item in currentQuestion.options" :key="item.id">
            <div><el-radio :value="currentQuestion.correct" :label="item.title"></el-radio></div>
            <div style="margin-top: 20px" v-if="item.img"><img :src="item.img" class="choice-img" /></div>
          </el-row>
        </div>
      </div>
      <div v-else>
        <el-row>简答题，请参见答案解析</el-row>
      </div>
      <el-row v-if="currentQuestion.videoURL">
        <el-button type="danger" @click="currentQuestion.videoShow = !currentQuestion.videoShow">{{
          currentQuestion.videoShow ? '收起解析视频' : '显示解析视频（这个视频插件好像需要鼠标点击一下才显示控制器）'
        }}</el-button>
      </el-row>
      <el-row v-else>
        <el-button type="info" disabled>没有可播放的视频解析</el-button>
      </el-row>
      <vueMiniPlayer :video="currentQuestion.video" v-if="currentQuestion.videoShow" />
      <el-divider></el-divider>
      <el-row>【答案解析】</el-row>
      <el-row v-html="currentQuestion.answer"></el-row>
      <el-divider></el-divider>
      <el-row>【题目备注】</el-row>
      <el-row>{{ currentQuestion.remarks }}</el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="viewDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { detail as questionDetail } from '@/api/hmmm/questions.js'
import { detail as catalogDetail } from '@/api/hmmm/directorys.js'
export default {
  name: 'QuestionPreview',
  props: {
    questionId: {
      type: Number,
      required: true
    }
  },
  created() {
    if (this.questionId) {
      this.viewQuestion(this.questionId)
    }
  },
  data() {
    return {
      currentQuestion: {},
      viewDialogVisible: false
    }
  },
  methods: {
    async viewQuestion(id) {
      try {
        const { data: res } = await questionDetail({ id: id })
        const catalog = await this.getCatalogById(res.catalogID)
        res.catalogName = catalog.directoryName
        res.video = {
          url: res.videoURL,
          autoplay: false,
          preload: 'auto'
        }
        res.videoShow = false
        if (res.options) {
          let count = 0
          res.correct = []
          res.options.forEach((item) => {
            if (item.code) {
              item.title = item.code + '. ' + item.title
            }
            if (item.isRight) {
              count++
              res.correct.push(item.title)
            }
          })
          console.log(count)
          if (count > 1) {
            res.isMultiple = true
          } else {
            res.isMultiple = false
            res.correct = res.correct[0]
          }
        }
        this.currentQuestion = res
        console.log(this.currentQuestion)
        this.viewDialogVisible = true
      } catch (err) {
        console.log(err)
        this.$message.error('显示问题详情失败')
        this.$emit('close')
      }
    },
    async getCatalogById(id) {
      try {
        const { data: res } = await catalogDetail({ id: id })
        return res
      } catch (err) {
        console.log(err)
        this.$message.error('获取指定目录失败')
      }
    },
    viewDialogClosed() {
      this.currentQuestion = {}
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  /deep/.el-dialog {
    width: 900px !important;
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
      padding: 20px 20px 0;
      .el-row {
        margin-bottom: 20px;
        p {
          margin: 0;
        }
        .choice-img {
          max-width: 100px;
          max-height: 100px;
        }
      }
      .el-divider {
        margin-bottom: 20px;
      }
      .qun-player {
        width: 500px;
        /deep/._time-current {
          display: inline-block;
          width: 50px;
        }
        /deep/._time-amount {
          display: inline-block;
          width: 50px;
        }
      }
    }
  }
}
</style>
