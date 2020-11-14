<template>
  <div class="container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>组题列表</span>
      </div>
      <el-form ref="searchForm" :model="queryInfo" label-position="left" label-width="100px" :inline="true">
        <div class="search-form">
          <el-form-item label="关键字：" prop="keyword">
            <el-input v-model="queryInfo.keyword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getRandom()">搜索</el-button>
            <el-button @click="$refs.searchForm.resetFields()">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
      <el-alert
        :title="
          '数据一共' +
          counts +
          '条' +
          '，注：不是所有的题目编号都能预览，原因可能出在后台接口上，那些不能预览的题目编号，对应的ID，在数据库里面是找不到的，因此可能是他删除某个题目的时候，没有做让他不再出现在这个题目列表上的处理'
        "
        type="info"
        show-icon
        style="margin-bottom: 20px"
        :closable="false"
      >
      </el-alert>
      <el-table :data="questions" style="width: 100%">
        <el-table-column prop="id" label="编号" width="195"> </el-table-column>
        <el-table-column label="题型" width="60">
          <template slot-scope="scope">
            {{ scope.row.questionType | parseQuestionType }}
          </template>
        </el-table-column>
        <el-table-column label="题目编号" width="200">
          <template slot-scope="scope">
            <div v-for="item in scope.row.questionIDs" :key="item.number">
              <el-button type="text" @click="currentQuestionId = item.id">{{ item.number }}</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="addTime" label="录入时间" width="160"> </el-table-column>
        <el-table-column prop="totalSeconds" label="答题时间（秒）" width="120"> </el-table-column>
        <el-table-column prop="accuracyRate" label="正确率（%）" width="120"> </el-table-column>
        <el-table-column prop="userName" label="录入人" width="100"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" circle plain @click="deleteQuestion(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="align-right" style="margin-top: 20px">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.page"
          :page-size="queryInfo.pagesize"
          :page-sizes="[5, 10, 20, 50]"
          layout="prev, pager, next, sizes, jumper"
          :total="counts"
          :background="true"
        >
        </el-pagination>
      </div>
    </el-card>
    <question-preview :question-id="currentQuestionId" v-if="currentQuestionId" @close="currentQuestionId = null"></question-preview>
  </div>
</template>

<script>
import { randoms, removeRandoms } from '@/api/hmmm/questions.js'
import QuestionPreview from '../components/questions-preview'
export default {
  name: 'QuestionRandoms',
  created() {
    this.getRandom()
  },
  data() {
    return {
      counts: 0,
      queryInfo: {
        page: 1,
        pagesize: 10,
        keyword: ''
      },
      questions: [],
      currentQuestionId: null
    }
  },
  methods: {
    async getRandom() {
      try {
        const { data: res } = await randoms(this.queryInfo)
        console.log(res)
        this.counts = res.counts
        this.questions = res.items
      } catch (err) {
        console.log(err)
        this.$message.error('获取组题列表失败')
      }
    },
    deleteQuestion(id) {
      this.$confirm('此操作将永久删除该组题, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await removeRandoms({ id: id })
          } catch (err) {
            console.log(err)
            this.$message.error('删除失败')
          }
          if (this.questions.length === 1) {
            if (this.queryInfo.page > 1) {
              this.queryInfo.page--
            }
          }
          await this.getRandom()
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
      this.queryInfo.pagesize = val
      this.queryInfo.page = 1
      this.getRandom()
    },
    handleCurrentChange(val) {
      this.queryInfo.page = val
      this.getRandom()
    }
  },
  components: {
    'question-preview': QuestionPreview
  }
}
</script>

<style scoped lang='less'>
.container {
  .search-form {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
  }
  .align-right {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
