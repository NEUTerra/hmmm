<template>
  <div class="container">
    <el-card shadow="never">
      <el-row class="align-right" style="margin-bottom: 20px">
        <el-button type="success" icon="el-icon-edit" @click="$router.push('new')">新增试题</el-button>
      </el-row>
      <el-form ref="filterForm" :model="filterForm" label-position="right" label-width="80px" size="small" :rules="filterFormRules">
        <el-row>
          <el-col :span="6">
            <el-form-item label="学科" prop="subjectID">
              <el-select
                v-model="filterForm.subjectID"
                @change="
                  getCatalogList()
                  getTagList()
                "
              >
                <el-option v-for="item in subjectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="二级目录" prop="catalogID">
              <el-select v-model="filterForm.catalogID">
                <el-option v-for="item in directoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标签" prop="tags">
              <el-select v-model="filterForm.tags">
                <el-option v-for="item in tagsList" :key="item.value" :label="item.label" :value="item.label"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="filterForm.keyword"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="试题类型" prop="questionType">
              <el-select v-model="filterForm.questionType">
                <el-option v-for="item in questionTypeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="filterForm.difficulty">
                <el-option v-for="item in difficultyList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="方向" prop="direction">
              <el-select v-model="filterForm.direction">
                <el-option v-for="(item, index) in directionList" :key="index" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="录入人" prop="creatorID">
              <el-select v-model="filterForm.creatorID">
                <el-option v-for="item in creatorList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="题目备注" prop="remarks">
              <el-input v-model="filterForm.remarks"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="企业简称" prop="shortName">
              <el-input v-model="filterForm.shortName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市">
              <el-col :span="11">
                <el-form-item label-width="0" prop="province"
                  ><el-select
                    v-model="filterForm.province"
                    @change="
                      getCityList()
                      filterForm.city = ''
                    "
                  >
                    <el-option v-for="(item, index) in provinceList" :key="index" :label="item" :value="item"> </el-option> </el-select
                ></el-form-item>
              </el-col>
              <el-col :span="11" :push="2">
                <el-form-item label-width="0" prop="city"
                  ><el-select v-model="filterForm.city"> <el-option v-for="(item, index) in cityList" :key="index" :label="item" :value="item"> </el-option></el-select></el-form-item
              ></el-col>
            </el-form-item>
          </el-col>
          <el-col :span="4" class="align-right">
            <el-form-item label-width="0">
              <el-button @click="$refs.filterForm.resetFields()">重置</el-button>
              <el-button type="primary" @click="getQuestions()">搜索</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-alert :title="'数据一共' + total + '条'" type="info" show-icon style="margin-bottom: 20px" :closable="false"> </el-alert>
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
          <!--  -->
          <template slot-scope="scope">
            {{ scope.row.addDate | parseTimeByString }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="80">
          <template slot-scope="scope">
            {{ scope.row.difficulty | parseDifficulty }}
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="录入人" width="100"> </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-view" circle plain @click="currentQuestionId = scope.row.id"></el-button>
            <el-button type="success" icon="el-icon-edit" circle plain @click="editQuestion(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle plain @click="deleteQuestion(scope.row.id)"></el-button>
            <el-button type="warning" icon="el-icon-check" circle plain @click="pickQuestion(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="align-right" style="margin-top: 20px">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="filterForm.page"
          :page-size="filterForm.pagesize"
          :page-sizes="[5, 10, 20, 50]"
          layout="prev, pager, next, sizes, jumper"
          :total="total"
          :background="true"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 对话框代码封装在question-preview里了。 -->

    <question-preview :question-id="currentQuestionId" v-if="currentQuestionId" @close="currentQuestionId = null"></question-preview>
  </div>
</template>

<script>
import { simple as subjectList, detail as subjectDetail } from '@/api/hmmm/subjects.js'
import { simple as directoryList, detail as catalogDetail } from '@/api/hmmm/directorys.js'
import { simple as tagList } from '@/api/hmmm/tags.js'
import { simple as userList } from '@/api/base/users.js'
import { questionType, difficulty, direction } from '@/api/hmmm/constants.js'
import { provinces, citys } from '@/api/hmmm/citys.js'
import { list as questionList, remove as removeQuestion, choiceAdd as pickQuestion } from '@/api/hmmm/questions.js'
import QuestionPreview from '../components/questions-preview'
export default {
  name: 'Questions',
  components: {
    'question-preview': QuestionPreview
  },
  created() {
    this.getSubjectList()
    this.getCreatorList()
    this.getQuestions()
  },
  data: function () {
    return {
      total: 0,
      questions: [],
      filterForm: {
        page: 1,
        pagesize: 10,
        subjectID: '',
        catalogID: '',
        tags: '',
        keyword: '',
        questionType: '',
        difficulty: '',
        direction: '',
        creatorID: '',
        remarks: '',
        shortName: '',
        province: '',
        city: ''
      },
      filterFormRules: {},
      subjectList: [],
      directoryList: [],
      tagsList: [],
      questionTypeList: questionType,
      difficultyList: difficulty,
      directionList: direction,
      creatorList: [],
      provinceList: provinces(),
      cityList: [],
      // viewDialogVisible: false,
      // currentQuestion: {}
      currentQuestionId: null
    }
  },
  methods: {
    async getQuestions() {
      const queryInfo = {}
      for (const key in this.filterForm) {
        if (this.filterForm[key]) {
          queryInfo[key] = this.filterForm[key]
        }
      }
      try {
        const { data: res } = await questionList(queryInfo)
        console.log(res)
        this.questions = res.items
        this.total = res.counts
      } catch (err) {
        console.log(err)
        this.$message.error('获取题目列表失败')
      }
    },
    async getSubjectById(id) {
      try {
        const { data: res } = await subjectDetail({ id: id })
        return res
      } catch (err) {
        console.log(err)
        this.$message.error('获取指定学科失败')
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
    handleSizeChange(val) {
      this.filterForm.pagesize = val
      this.filterForm.page = 1
      this.getQuestions()
    },
    handleCurrentChange(val) {
      this.filterForm.page = val
      this.getQuestions()
    },
    async getSubjectList() {
      try {
        const { data: res } = await subjectList()
        console.log(res)
        this.subjectList = res
      } catch (err) {
        console.log(err)
        this.$message.error('获取学科列表失败')
      }
    },
    async getCatalogList() {
      try {
        const { data: res } = await directoryList({
          subjectID: this.filterForm.subjectID
        })
        console.log(res)
        this.filterForm.catalogID = ''
        this.directoryList = res
      } catch (err) {
        console.log(err)
        this.$message.error('获取目录列表失败')
      }
    },
    async getTagList() {
      try {
        const { data: res } = await tagList({
          subjectID: this.filterForm.subjectID
        })
        console.log(res)
        this.filterForm.tags = ''
        this.tagsList = res
      } catch (err) {
        console.log(err)
        this.$message.error('获取标签列表失败')
      }
    },
    async getCreatorList() {
      try {
        const { data: res } = await userList()
        console.log(res)
        this.creatorList = res.map((item) => {
          return {
            value: item.id,
            label: item.username
          }
        })
      } catch (err) {
        console.log(err)
        this.$message.error('获取创建者失败')
      }
    },
    getCityList() {
      this.cityList = citys(this.filterForm.province)
    },
    editQuestion(id) {
      this.$router.push('new/' + id)
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
          if (this.questions.length === 1) {
            if (this.filterForm.page > 1) {
              this.filterForm.page--
            }
          }
          await this.getQuestions()
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
    pickQuestion(id) {
      this.$confirm('此操作将该题目加入精选, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(async () => {
          try {
            await pickQuestion({ id: id, choiceState: 1 })
          } catch (err) {
            console.log(err)
            return this.$message.error('加入精选失败')
          }
          if (this.questions.length === 1) {
            if (this.filterForm.page > 1) {
              this.filterForm.page--
            }
          }
          await this.getQuestions()
          this.$message({
            type: 'success',
            message: '加入精选成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  .align-right {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
