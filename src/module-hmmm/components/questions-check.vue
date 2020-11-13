<template>
  <div class="container">
    <el-dialog title="题目审核" :visible.sync="dialogVisible" width="30%" @close="dialogClosed">
      <el-form ref="checkForm" :model="checkForm" :rules="checkFormRules" label-width="0">
        <el-row>
          <el-form-item prop="chkState">
            <el-radio-group v-model="checkForm.chkState">
              <el-radio :label="1">同意</el-radio>
              <el-radio :label="2">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item prop="chkRemarks">
            <el-input type="textarea" placeholder="请输入审核意见" v-model="checkForm.chkRemarks"> </el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="choiceCheck">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { choiceCheck } from '@/api/hmmm/questions.js'
export default {
  name: 'QuestionsCheck',
  created() {
    if (this.questionId) {
      this.dialogVisible = true
    }
  },
  props: {
    questionId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      checkForm: {
        id: this.questionId,
        chkState: 1,
        chkRemarks: ''
      },
      checkFormRules: {
        chkRemarks: [{ required: true, message: '请输入审核意见', trigger: 'blur' }]
      }
    }
  },
  methods: {
    choiceCheck() {
      this.$refs.checkForm.validate(async (valid) => {
        if (!valid) {
          this.$message.error('信息不完整！')
        } else {
          try {
            await choiceCheck(this.checkForm)
            this.$emit('refresh')
            this.$message({
              type: 'success',
              message: '审核成功!'
            })
            this.dialogVisible = false
          } catch (err) {
            this.$message.error('审核失败')
            return console.log(err)
          }
        }
      })
    },
    dialogClosed() {
      this.$refs.checkForm.resetFields()
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  /deep/.el-dialog {
    width: 400px !important;
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
        /deep/textarea {
          width: 100%;
          height: 200px;
          resize: none;
        }
      }
    }
  }
}
</style>
