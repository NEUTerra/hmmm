<template>
  <div class="container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <el-breadcrumb v-if="subjectId" v-show="subjectName">
          <el-breadcrumb-item :to="{ path: '/subjects/list' }">学科管理</el-breadcrumb-item>
          <el-breadcrumb-item>{{ subjectName }}</el-breadcrumb-item>
          <el-breadcrumb-item>标签管理</el-breadcrumb-item>
        </el-breadcrumb>
        <span v-else>标签管理</span>
      </div>
      <div class="top-row">
        <el-form ref="searchForm" :model="queryInfo" label-position="left" label-width="100px" :inline="true">
          <el-form-item label="标签名称：" prop="tagName">
            <el-input v-model="queryInfo.tagName"></el-input>
          </el-form-item>
          <el-form-item label="状态：" prop="state">
            <el-select v-model="queryInfo.state">
              <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getTags">搜索</el-button>
            <el-button @click="$refs.searchForm.resetFields()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="add-btn-container">
          <el-button type="text" icon="el-icon-back" @click="$router.push('/subjects/list')">返回学科</el-button>
          <el-button type="success" icon="el-icon-edit" @click="addTag">新增标签</el-button>
        </div>
      </div>
      <el-table :data="tags" style="width: 100%">
        <el-table-column prop="id" label="序号" width="60"> </el-table-column>
        <el-table-column prop="subjectName" label="所属学科" width="180"> </el-table-column>
        <el-table-column prop="tagName" label="标签名称" width="180"> </el-table-column>
        <el-table-column prop="creator" label="创建者" width="180"> </el-table-column>
        <el-table-column label="创建日期" width="180">
          <template slot-scope="scope">
            {{ scope.row.addDate | parseTimeByString }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            {{ scope.row.state ? '已启用' : '已禁用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="changeTagState(scope.row.id, scope.row.state)">{{ scope.row.state ? '禁用' : '启用' }}</el-button>
            <el-button type="text" size="small" @click="editTag(scope.row.id)" :disabled="scope.row.state === 1">修改</el-button>
            <el-button type="text" size="small" @click="deleteTag(scope.row.id)" :disabled="scope.row.state === 1">删除</el-button>
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
    <tags-add
      v-if="addShow && currentTagId"
      :id="currentTagId"
      @close="
        addShow = false
        currentTagId = null
        getTags()
      "
    ></tags-add>
    <tags-add
      v-if="addShow && !currentTagId"
      @close="
        addShow = false
        currentTagId = null
        getTags()
      "
    ></tags-add>
  </div>
</template>

<script>
import { detail as subjectDetail } from '@/api/hmmm/subjects.js'
import { list as tagList, changeState, remove as removeTag } from '@/api/hmmm/tags.js'
import { detail as userDetail } from '@/api/base/users.js'
import { status } from '@/api/hmmm/constants.js'
import TagsAdd from '../components/tags-add'
export default {
  name: 'Tags',
  props: {
    subjectId: {
      type: [Number, String],
      required: false
    }
  },
  components: {
    'tags-add': TagsAdd
  },
  created() {
    this.init()
  },
  data() {
    return {
      queryInfo: {
        page: 1,
        pagesize: 10,
        tagName: '',
        state: ''
      },
      counts: 0,
      tags: [],
      subjectName: '',
      currentTagId: null,
      addShow: false,
      stateList: status
    }
  },
  methods: {
    async getTags() {
      const formCopy = {}
      for (const key in this.queryInfo) {
        if (this.queryInfo[key] !== '') {
          formCopy[key] = this.queryInfo[key]
        }
      }
      if (this.subjectId) {
        formCopy.subjectID = this.subjectId
      }
      try {
        this.tags.splice(0)
        const { data: res } = await tagList(formCopy)
        res.items.forEach(async (item) => {
          try {
            const { data: res } = await userDetail({ id: item.creatorID })
            console.log(res)
            item.creator = res.username
            this.tags.push(item)
          } catch (err) {
            console.log(err)
          }
        })
        this.counts = res.counts
      } catch (err) {
        console.log(err)
        this.$message.error('获取标签列表失败')
      }
    },
    addTag() {
      this.currentTagId = null
      this.addShow = true
    },
    editTag(id) {
      this.currentTagId = id
      this.addShow = true
    },
    deleteTag(id) {
      this.$confirm('此操作将永久删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await removeTag({ id: id })
          } catch (err) {
            console.log(err)
            this.$message.error('删除失败')
          }
          if (this.tags.length === 1) {
            if (this.queryInfo.page > 1) {
              this.queryInfo.page--
            }
          }
          await this.getTags()
          this.$message({
            type: 'success',
            message: '删除成功！'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    changeTagState(id, state) {
      this.$confirm('是否' + (state ? '禁用' : '启用') + '该标签', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await changeState({ id: id, state: 1 - state })
          } catch (err) {
            console.log(err)
            this.$message.error((state ? '禁用' : '启用') + '失败')
          }
          await this.getTags()
          this.$message({
            type: 'success',
            message: (state ? '禁用' : '启用') + '成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.page = 1
      this.getTags()
    },
    handleCurrentChange(val) {
      this.queryInfo.page = val
      this.getTags()
    },
    async init() {
      if (this.subjectId) {
        const { data: res } = await subjectDetail({ id: this.subjectId })
        console.log(res)
        this.subjectName = res.subjectName
      }
      this.getTags()
    }
  },
  watch: {
    subjectId: function (val) {
      this.init()
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
  .top-row {
    display: flex;
    margin-bottom: 20px;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .add-btn-container {
      display: flex;
      flex: 1;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .el-breadcrumb {
    /deep/.el-breadcrumb__inner.is-link {
      color: #606266;
      &:hover {
        color: #2396f7;
      }
    }
  }
}
</style>
