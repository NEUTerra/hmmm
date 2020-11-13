<template>
  <div class="container">
    <el-alert :title="'数据一共' + total + '条'" type="info" effect="dark" style="margin-bottom: 20px"> </el-alert>
    <el-table :data="questions" style="width: 100%">
      <el-table-column prop="number" label="试题编号" width="100"> </el-table-column>
      <el-table-column prop="subject" label="学科" width="80"> </el-table-column>
      <el-table-column prop="catalog" label="目录" width="80"> </el-table-column>
      <el-table-column prop="questionType" label="题型" width="80">
        <template slot-scope="scope">
          {{ scope.row.questionType | parseQuestionType }}
        </template>
      </el-table-column>
      <el-table-column label="题干" width="260">
        <template slot-scope="scope"> <div v-html="scope.row.question"></div> </template>
      </el-table-column>
      <el-table-column label="录入时间" width="160">
        <template slot-scope="scope">
          {{ scope.row.addDate | parseTimeByString }}
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度" width="80">
        <template slot-scope="scope">
          {{ scope.row.difficulty | parseDifficulty }}
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="录入人" width="120"> </el-table-column>
      <el-table-column label="审核状态" width="120">
        <template slot-scope="scope">
          {{ scope.row.chkState | parseChkState }}
        </template>
      </el-table-column>
      <el-table-column prop="chkRemarks" label="审核意见" width="150"></el-table-column>
      <el-table-column prop="chkUser" label="审核人" width="150"></el-table-column>
      <el-table-column label="发布状态" width="150">
        <template slot-scope="scope">
          {{ scope.row.publishState | parsePublishState }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="
              $emit('change-current-question', scope.row.id)
              $emit('preview-show')
            "
            >预览</el-button
          >
          <el-button
            type="text"
            size="small"
            :disabled="scope.row.chkState !== 0"
            @click="
              $emit('change-current-question', scope.row.id)
              $emit('check-show')
            "
            >审核</el-button
          >
          <el-button type="text" size="small" @click="$router.push('new/' + scope.row.id)" :disabled="scope.row.publishState === 1">修改</el-button>
          <el-button type="text" size="small" @click="changePublishState(scope.row.id, scope.row.publishState)">{{ scope.row.publishState === 0 ? '上架' : '下架' }}</el-button>
          <el-button type="text" size="small" :disabled="scope.row.publishState === 1" @click="deleteQuestion(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="align-right" style="margin-top: 20px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-size="pagesize"
        :page-sizes="[5, 10, 20, 50]"
        layout="prev, pager, next, sizes, jumper"
        :total="total"
        :background="true"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { choice as choiceQuestionList, remove as removeQuestion, choicePublish } from '@/api/hmmm/questions.js'
export default {
  name: 'QuestionChoiceTable',
  props: {
    filterForm: {
      type: Object,
      required: true
    },
    chkState: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      page: 1,
      pagesize: 5,
      total: 0,
      questions: []
    }
  },
  created() {
    this.getQuestions()
  },
  methods: {
    async getQuestions() {
      const queryInfo = {}
      for (const key in this.filterForm) {
        if (this.filterForm[key]) {
          queryInfo[key] = this.filterForm[key]
        }
      }
      if (this.chkState !== 3) {
        queryInfo.chkState = this.chkState
      }
      queryInfo.page = this.page
      queryInfo.pagesize = this.pagesize
      try {
        const { data: res } = await choiceQuestionList(queryInfo)
        console.log(res)
        this.questions = res.items
        this.total = res.counts
        if (this.questions.length === 0) {
          if (this.page > 1) {
            this.page--
            this.getQuestions()
          }
        }
      } catch (err) {
        console.log(err)
        this.$message.error('获取题目列表失败')
      }
    },
    changePublishState(id, state) {
      // console.log(id, state)
      const text = state === 0 ? '您确定上架这道题目吗？' : '您确定下架这道题目吗？'
      this.$confirm(text, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await choicePublish({
              id: id,
              publishState: 1 - state
            })
          } catch (err) {
            console.log(err)
            return this.$message.error(state === 0 ? '上架失败' : '下架失败')
          }
          this.$emit('refresh')
          this.$message({
            type: 'success',
            message: state === 0 ? '上架成功!' : '下架成功'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    deleteQuestion(id) {
      this.$confirm('此操作将永久删除该题目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await removeQuestion({ id: id })
          } catch (err) {
            console.log(err)
            return this.$message.error('删除失败')
          }
          this.$emit('refresh')
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleSizeChange(val) {
      this.pagesize = val
      this.page = 1
      this.getQuestions()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getQuestions()
    }
  }
}
</script>

<style scoped lang="less">
.container {
  .align-right {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
