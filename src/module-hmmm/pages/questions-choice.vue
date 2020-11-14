<template>
  <div class="container">
    <el-card shadow="never">
      <!-- 我发现这个表单根本不需要验证。。。。 -->
      <el-form ref="filterForm" :model="filterForm" label-position="right" label-width="80px" size="small">
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
              <el-button type="primary" @click="refreshAll()">搜索</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all">
          <question-choice-table
            ref="all"
            :filter-form="filterForm"
            :chk-state="3"
            @change-current-question="changeCurrentQuestion"
            @preview-show="previewShow = true"
            @check-show="checkShow = true"
            @refresh="refreshAll"
          ></question-choice-table>
        </el-tab-pane>
        <el-tab-pane label="待审核" name="unchecked">
          <question-choice-table
            ref="unchecked"
            :filter-form="filterForm"
            :chk-state="0"
            @change-current-question="changeCurrentQuestion"
            @preview-show="previewShow = true"
            @check-show="checkShow = true"
            @refresh="refreshAll"
          ></question-choice-table>
        </el-tab-pane>
        <el-tab-pane label="已审核" name="checked">
          <question-choice-table
            ref="checked"
            :filter-form="filterForm"
            :chk-state="1"
            @change-current-question="changeCurrentQuestion"
            @preview-show="previewShow = true"
            @check-show="checkShow = true"
            @refresh="refreshAll"
          ></question-choice-table>
        </el-tab-pane>
        <el-tab-pane label="已拒绝" name="rejected">
          <question-choice-table
            ref="rejected"
            :filter-form="filterForm"
            :chk-state="2"
            @change-current-question="changeCurrentQuestion"
            @preview-show="previewShow = true"
            @check-show="checkShow = true"
            @refresh="refreshAll"
          ></question-choice-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <question-preview
      :question-id="currentQuestionId"
      v-if="previewShow && currentQuestionId"
      @close="
        currentQuestionId = null
        previewShow = false
      "
    ></question-preview>
    <question-check
      :question-id="currentQuestionId"
      v-if="checkShow && currentQuestionId"
      @refresh="refreshAll"
      @close="
        currentQuestionId = null
        checkShow = false
      "
    >
    </question-check>
  </div>
</template>

<script>
import { simple as subjectList, detail as subjectDetail } from '@/api/hmmm/subjects.js'
import { simple as directoryList, detail as catalogDetail } from '@/api/hmmm/directorys.js'
import { simple as tagList } from '@/api/hmmm/tags.js'
import { simple as userList } from '@/api/base/users.js'
import { questionType, difficulty, direction } from '@/api/hmmm/constants.js'
import { provinces, citys } from '@/api/hmmm/citys.js'
import QuestionChoiceTable from '../components/question-choice-table'
import QuestionPreview from '../components/questions-preview'
import QuestionCheck from '../components/questions-check'
// import { list as questionList, detail as questionDetail, remove as removeQuestion, choiceAdd as pickQuestion } from '@/api/hmmm/questions.js'
export default {
  name: 'QuestionChoice',
  created() {
    this.getSubjectList()
    this.getCreatorList()
    // this.getQuestions()
  },
  components: {
    'question-choice-table': QuestionChoiceTable,
    'question-preview': QuestionPreview,
    'question-check': QuestionCheck
  },
  data() {
    return {
      total: 0,
      questions: [],
      currentQuestionId: null,
      previewShow: false,
      checkShow: false,
      activeName: 'all',
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
        // chkState: ''
      },
      subjectList: [],
      directoryList: [],
      tagsList: [],
      questionTypeList: questionType,
      difficultyList: difficulty,
      directionList: direction,
      creatorList: [],
      provinceList: provinces(),
      cityList: []
    }
  },
  methods: {
    handleTabClick(tab, event) {
      console.log(tab, event)
    },
    changeCurrentQuestion(id) {
      this.currentQuestionId = id
    },
    refreshAll() {
      this.$refs.all.getQuestions()
      this.$refs.unchecked.getQuestions()
      this.$refs.checked.getQuestions()
      this.$refs.rejected.getQuestions()
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
