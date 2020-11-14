<template>
  <div class="container">
    <el-dialog :title="id ? '标签修改' : '标签添加'" :visible.sync="dialogVisible" width="30%" @close="dialogClosed">
      <el-form ref="addForm" :model="addForm" label-position="left" label-width="80px" size="medium" :rules="addFormRules" v-loading="loading && id" element-loading-text="拼命加载中">
        <el-form-item label="学科" prop="subjectID" v-show="!id">
          <el-select v-model="addForm.subjectID" style="width: 100%" @blur="$refs.addForm.validateField('subjectID')">
            <el-option v-for="item in subjectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签名" prop="tagName">
          <el-input class="w400" v-model.trim="addForm.tagName" placeholder="请输入文章标题"></el-input>
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
import { simple as subjectList } from '@/api/hmmm/subjects.js'
import { detail as tagDetail, add as addTag, update as updateTag } from '@/api/hmmm/tags.js'
export default {
  name: 'TagsAdd',
  props: {
    id: {
      type: [Number, String],
      required: false
    }
  },
  async created() {
    await this.getSubjectList()
    if (this.id) {
      await this.getTag()
    }
    this.loading = false
    this.dialogVisible = true
  },
  data() {
    return {
      addForm: {
        subjectID: '',
        tagName: ''
      },
      addFormRules: {
        subjectID: [{ required: true, message: '学科不能为空', trigger: ['blur', 'change'] }],
        tagName: [{ required: true, message: '标签名不能为空', trigger: 'blur' }]
      },
      dialogVisible: false,
      loading: true,
      subjectList: []
    }
  },
  methods: {
    async getTag() {
      try {
        const { data: res } = await tagDetail({ id: this.id })
        console.log(res)
        this.addForm.id = res.id
        this.addForm.subjectID = res.subjectID
        this.addForm.tagName = res.tagName
        console.log(this.addForm)
      } catch (err) {
        console.log('获取标签详情失败！')
        this.$message.error('获取标签详情失败！')
        this.$emit('close')
      }
    },
    async submitForm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.id) {
              await updateTag(this.addForm)
              this.$message.success('标签修改成功！')
            } else {
              await addTag(this.addForm)
              this.$message.success('标签创建成功！')
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
    dialogClosed() {
      this.addForm = {}
      this.$emit('close')
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
    }
  }
}
</script>

<style scoped lang='less'></style>
