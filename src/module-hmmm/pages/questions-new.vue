<template>
  <div class="container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>{{ id ? '试题修改' : '试题录入' }} 注：对于el-select来说，想点一下就进行它的表单校验，需要使用他自己的blur事件</span>
      </div>
      <el-form ref="addForm" :model="addForm" label-position="right" label-width="100px" size="medium" :rules="addFormRules" v-loading="loading && id" element-loading-text="拼命加载中">
        <el-form-item label="学科：" prop="subjectID">
          <el-select
            class="w400"
            v-model="addForm.subjectID"
            @change="
              getCatalogList()
              getTagList()
            "
            @blur="$refs.addForm.validateField('subjectID')"
          >
            <el-option v-for="item in subjectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目录：" prop="catalogID">
          <el-select class="w400" v-model="addForm.catalogID" @blur="$refs.addForm.validateField('catalogID')">
            <el-option v-for="item in directoryList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业：" prop="enterpriseID">
          <el-select class="w400" v-model="addForm.enterpriseID" @blur="$refs.addForm.validateField('enterpriseID')">
            <el-option v-for="item in enterpriseList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="城市：" prop="city">
          <el-select
            style="width: 195px; margin-right: 10px"
            v-model="addForm.province"
            @change="
              getCityList()
              addForm.city = ''
            "
            @blur="$refs.addForm.validateField('city')"
          >
            <el-option v-for="(item, index) in provinceList" :key="index" :label="item" :value="item"> </el-option>
          </el-select>
          <el-select style="width: 195px" v-model="addForm.city">
            <el-option v-for="(item, index) in cityList" :key="index" :label="item" :value="item" @blur="$refs.addForm.validateField('city')"> </el-option
          ></el-select>
        </el-form-item>
        <el-form-item label="方向：" prop="direction">
          <el-select class="w400" v-model="addForm.direction" @blur="$refs.addForm.validateField('direction')">
            <el-option v-for="(item, index) in directionList" :key="index" :label="item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题型：" prop="questionType">
          <el-radio-group v-model="addForm.questionType" @change="questionTypeChange">
            <el-radio :label="1">单选</el-radio>
            <el-radio :label="2">多选</el-radio>
            <el-radio :label="3">简答</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="难度：" prop="difficulty">
          <el-radio-group v-model="addForm.difficulty">
            <el-radio :label="1">简单</el-radio>
            <el-radio :label="2">一般</el-radio>
            <el-radio :label="3">困难</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="题干：" prop="question">
          <quill-editor v-model.trim="addForm.question" class="ql-editor" :options="editorOption" @blur="onEditorBlur($event, 'question')"> </quill-editor>
        </el-form-item>
        <el-form-item label="选项：" v-if="addForm.questionType !== 3">
          <div v-if="addForm.questionType === 1" class="options">
            <el-row v-for="item in addForm.options" :key="item.code">
              <el-radio v-model="singleChoice" :label="item.code" style="margin-right: 10px"> </el-radio>
              <el-input style="width: 240px; margin-right: 10px" v-model.trim="item.title"></el-input>
              <el-upload
                class="avatar-uploader"
                action="http://127.0.0.1:8888/api/private/v1/upload"
                name="file"
                :headers="{ Authorization: photoToken }"
                :show-file-list="false"
                :on-success="
                  (res, file) => {
                    return handleAvatarSuccess(res, file, item)
                  }
                "
              >
                <img v-if="item.img" :src="item.img" class="avatar" />
                <span v-else>上传图片</span>
                <i class="el-icon-circle-close" @click.stop="item.img = ''"></i>
              </el-upload>
            </el-row>
            <el-row>
              <el-button type="primary" size="medium" @click="addOption">+ 增加选项与答案（最多不超过7个）</el-button>
              <el-button type="warning" size="medium" style="margin-right: 10px" @click="resetOption">重置选项</el-button>
            </el-row>
          </div>
          <div v-else-if="addForm.questionType === 2" class="options">
            <el-row v-for="item in addForm.options" :key="item.code">
              <el-checkbox v-model="item.isRight" style="margin-right: 10px">{{ item.code }}</el-checkbox>
              <el-input style="width: 240px; margin-right: 10px" v-model.trim="item.title"></el-input>
              <el-upload
                class="avatar-uploader"
                action="http://127.0.0.1:8888/api/private/v1/upload"
                name="file"
                :headers="{ Authorization: photoToken }"
                :show-file-list="false"
                :on-success="
                  (res, file) => {
                    return handleAvatarSuccess(res, file, item)
                  }
                "
              >
                <img v-if="item.img" :src="item.img" class="avatar" />
                <span v-else>上传图片</span>
                <i class="el-icon-circle-close" @click.stop="item.img = ''"></i>
              </el-upload>
            </el-row>
            <el-row>
              <el-button type="primary" size="medium" @click="addOption" :disabled="addForm.options.length === 7">+ 增加选项与答案（最多不超过7个）</el-button>
              <el-button type="warning" size="medium" style="margin-right: 10px" @click="resetOption">重置选项</el-button>
            </el-row>
          </div>
        </el-form-item>
        <el-form-item label="解析视频：" prop="videoURL">
          <el-input class="w400" v-model="addForm.videoURL"></el-input>
        </el-form-item>
        <el-form-item label="答案解析：" prop="answer">
          <quill-editor v-model.trim="addForm.answer" class="ql-editor" :options="editorOption" @blur="onEditorBlur($event, 'answer')"> </quill-editor>
        </el-form-item>
        <el-form-item label="题目备注：" prop="remarks">
          <el-input type="textarea" placeholder="请输入题目备注" v-model.trim="addForm.remarks"> </el-input>
        </el-form-item>
        <el-form-item label="试题标签：" prop="tags">
          <el-select class="w400" v-model="addForm.tags" multiple @blur="$refs.addForm.validateField('tags')">
            <el-option v-for="item in tagsList" :key="item.value" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { simple as subjectList } from '@/api/hmmm/subjects.js'
import { simple as directoryList } from '@/api/hmmm/directorys.js'
import { list as enterpriseList } from '@/api/hmmm/companys.js'
import { simple as tagList } from '@/api/hmmm/tags.js'
import { questionType, difficulty, direction } from '@/api/hmmm/constants.js'
import { provinces, citys } from '@/api/hmmm/citys.js'
import photoServerRequest from '@/utils/photoServerRequest.js'
import { add as addQuestion, detail as detailQuestion, update as updateQuestion } from '@/api/hmmm/questions.js'
import { mapGetters } from 'vuex'
const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
const defaultOptions = [
  { code: 'A', title: '', img: '', isRight: false },
  { code: 'B', title: '', img: '', isRight: false },
  { code: 'C', title: '', img: '', isRight: false },
  { code: 'D', title: '', img: '', isRight: false }
]
export default {
  name: 'QuestionsNew',
  props: {
    id: {
      type: [Number, String],
      required: false
    }
  },
  async created() {
    await this.getSubjectList()
    await this.getEnterpriseList()
    this.resetOption()
    const { data: res } = await photoServerRequest({
      method: 'POST',
      url: 'login',
      data: { username: 'admin', password: '123456' }
    })
    console.log(res)
    if (res.meta.status !== 200) {
      return this.$message.error('用户名或密码不正确！')
    }
    localStorage.setItem('photoToken', res.data.token)
    if (this.id) {
      this.initEditForm()
    }
  },
  data() {
    return {
      loading: true,
      addForm: {
        subjectID: '',
        catalogID: '',
        enterpriseID: '',
        province: '',
        city: '',
        direction: '',
        questionType: 1,
        difficulty: 1,
        question: '',
        options: [],
        videoURL: '',
        answer: '',
        tags: []
      },
      singleChoice: 'A',
      token: '',
      // currentChoice: null,
      addFormRules: {
        subjectID: [{ required: true, message: '请选择学科', trigger: ['blur', 'change'] }],
        catalogID: [{ required: true, message: '请选择目录', trigger: ['blur', 'change'] }],
        enterpriseID: [{ required: true, message: '请选择企业', trigger: ['blur', 'change'] }],
        city: [{ required: true, message: '请选择城市地区', trigger: ['blur', 'change'] }],
        direction: [{ required: true, message: '请选择方向', trigger: ['blur', 'change'] }],
        questionType: [{ required: true, message: '请选择题目类型', trigger: ['blur', 'change'] }],
        difficulty: [{ required: true, message: '请选择难度', trigger: ['blur', 'change'] }],
        question: [{ required: true, message: '题干不能为空', trigger: 'blur' }],
        answer: [{ required: true, message: '答案解析不能为空', trigger: 'blur' }],
        tags: [
          { required: true, message: '标签不能为空（接口要求的。。。）', trigger: ['blur', 'change'] },
          {
            validator: (rule, value, callback) => {
              if (value.length === 0) {
                callback(new Error('标签不能为空（接口要求的。。。）'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      subjectList: [],
      directoryList: [],
      tagsList: [],
      questionTypeList: questionType,
      difficultyList: difficulty,
      enterpriseList: [],
      directionList: direction,
      provinceList: provinces(),
      cityList: [],
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
    async initEditForm() {
      const { data: res } = await detailQuestion({ id: this.id })
      console.log(res)
      this.addForm.subjectID = res.subjectID
      await this.getCatalogList()
      await this.getTagList()
      this.addForm = res
      this.addForm.difficulty -= 0
      this.addForm.questionType -= 0
      this.addForm.tags = this.addForm.tags.split(',')
      if (this.addForm.questionType === 1) {
        this.singleChoice = this.addForm.options.find((item) => item.isRight).code
      }
      this.addForm.id = parseInt(this.id)
      this.loading = false
    },
    submitForm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          const formCopy = JSON.parse(JSON.stringify(this.addForm))
          if (formCopy.questionType === 1) {
            formCopy.options.forEach((item) => {
              if (item.code === this.singleChoice) {
                item.isRight = true
              } else {
                item.isRight = false
              }
            })
          } else if (formCopy.questionType === 2) {
            if (formCopy.options.every((item) => !item.isRight)) {
              return this.$message.error('多选至少有一个正确选项！')
            }
          }
          if (formCopy.options.some((item) => !item.title.length)) {
            return this.$message.error('选项内容不能为空！')
          }
          formCopy.difficulty = '' + formCopy.difficulty
          formCopy.questionType = '' + formCopy.questionType
          formCopy.tags = formCopy.tags ? formCopy.tags.join(',') : ''
          console.log(JSON.stringify(formCopy))
          try {
            if (this.id) {
              await updateQuestion(formCopy)
              this.$message.success('题目修改成功！')
            } else {
              await addQuestion(formCopy)
              this.$message.success('题目创建成功！')
            }
            if (this.addForm.isChoice === 1) {
              this.$router.push('/questions/choice')
            } else {
              this.$router.push('/questions/list')
            }
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
    questionTypeChange(val) {
      if (val !== 3) {
        this.resetOption()
      } else {
        this.addForm.options = null
      }
    },
    addOption() {
      this.addForm.options.push({ code: codes[this.addForm.options.length], title: '', img: '', isRight: false })
    },
    resetOption() {
      this.addForm.options = JSON.parse(JSON.stringify(defaultOptions))
      if (this.addForm.questionType === 1) {
        this.singleChoice = 'A'
        this.addForm.options[0].isRight = true
      }
    },
    handleAvatarSuccess(res, file, item) {
      // console.log(res, file)
      item.img = 'http://127.0.0.1:8888/' + res.data.tmp_path
    },
    async beforeAvatarUpload() {},
    onEditorBlur(event, field) {
      this.$refs.addForm.validateField(field)
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
          subjectID: this.addForm.subjectID
        })
        console.log(res)
        this.addForm.catalogID = ''
        this.directoryList = res
      } catch (err) {
        console.log(err)
        this.$message.error('获取目录列表失败')
      }
    },
    async getEnterpriseList() {
      try {
        const { data: res } = await enterpriseList({
          pagesize: 50
        })
        console.log(res)
        this.enterpriseList = res.items.map((item) => {
          return {
            value: item.id,
            label: item.company
          }
        })
      } catch (err) {
        console.log(err)
        this.$message.error('获取企业列表失败')
      }
    },
    async getTagList() {
      try {
        const { data: res } = await tagList({
          subjectID: this.addForm.subjectID
        })
        console.log(res)
        this.addForm.tags = ''
        this.tagsList = res
      } catch (err) {
        console.log(err)
        this.$message.error('获取标签列表失败')
      }
    },
    getCityList() {
      this.cityList = citys(this.addForm.province)
    }
  },
  computed: {
    ...mapGetters(['photoToken'])
  }
}
</script>

<style scoped lang='less'>
.container {
  .w400 {
    width: 400px;
  }
  .el-form {
    position: relative;
    /deep/.el-loading-mask {
      z-index: 1;
      /deep/.el-loading-spinner {
        top: 5%;
      }
    }
  }
  .ql-editor {
    padding: 0;
    margin-top: -10px;
    /deep/.ql-container {
      height: 300px;
    }
  }
  .options {
    margin-top: -11px;
    .el-row {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .avatar-uploader {
        width: 100px !important;
        height: 60px !important;
        /deep/ .el-upload {
          position: relative;
          width: 100px;
          height: 60px;
          border: 1px dashed #d9d9d9;
          line-height: 58px;
          border-radius: 6px;
          /deep/img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 90px;
            max-height: 55px;
          }
          /deep/input[type='file'] {
            display: none;
          }
          /deep/.el-icon-circle-close {
            position: absolute;
            right: 0;
            top: 0;
            transform: translate(50%, -50%);
            font-size: 24px;
          }
        }
      }
    }
  }
  .el-textarea {
    /deep/textarea {
      width: 400px;
      height: 200px;
      resize: vertical;
    }
  }
}
</style>
