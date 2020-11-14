<template>
  <div class="container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>面试技巧</span>
      </div>
      <div class="top-row">
        <el-form ref="searchForm" :model="queryInfo" label-position="left" label-width="70px" :inline="true">
          <el-form-item label="关键字：" prop="keyword">
            <el-input v-model="queryInfo.keyword"></el-input>
          </el-form-item>
          <el-form-item label="状态：" prop="state">
            <el-select v-model="queryInfo.state">
              <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getArticles()">搜索</el-button>
            <el-button @click="$refs.searchForm.resetFields()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="add-btn-container">
          <el-button type="success" icon="el-icon-edit" @click="addArticle">新增技巧</el-button>
        </div>
      </div>
      <el-table :data="articles" style="width: 100%">
        <el-table-column prop="id" label="序号" width="60"> </el-table-column>
        <el-table-column label="文章标题" width="280">
          <template slot-scope="scope">
            {{ scope.row.title }}
            <i class="el-icon-film" style="color: #3440ff" v-if="scope.row.videoURL" @click="videoURL = scope.row.videoURL"></i>
          </template>
        </el-table-column>
        <el-table-column prop="visits" label="阅读数" width="120"> </el-table-column>
        <el-table-column prop="username" label="录入人" width="120"> </el-table-column>
        <el-table-column label="录入时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.createTime | parseTimeByString }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            {{ scope.row.state ? '已启用' : '已禁用' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="previewArticle(scope.row.id)">预览</el-button>
            <el-button type="text" size="small" @click="changeArticleState(scope.row.id, scope.row.state)">{{ scope.row.state ? '禁用' : '启用' }}</el-button>
            <el-button type="text" size="small" @click="editArticle(scope.row.id)" :disabled="scope.row.state === 1">修改</el-button>
            <el-button type="text" size="small" @click="deleteArticle(scope.row.id)" :disabled="scope.row.state === 1">删除</el-button>
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
    <div class="mask" v-if="videoURL">
      <div class="center-align">
        <div class="close-video-btn" @click="videoURL = null">×</div>
        <vueMiniPlayer
          :video="{
            url: videoURL,
            autoplay: true,
            preload: 'auto'
          }"
        />
      </div>
    </div>
    <articles-preview
      v-if="previewShow && currentArticleId"
      :id="currentArticleId"
      @close="
        previewShow = false
        currentArticleId = null
      "
    ></articles-preview>
    <articles-add
      v-if="addShow && currentArticleId"
      :id="currentArticleId"
      @close="
        addShow = false
        currentArticleId = null
        getArticles()
      "
    ></articles-add>
    <articles-add
      v-if="addShow && !currentArticleId"
      @close="
        addShow = false
        currentArticleId = null
        getArticles()
      "
    ></articles-add>
  </div>
</template>

<script>
import { status } from '@/api/hmmm/constants.js'
import { list as articleList, changeState, remove as removeArticle } from '@/api/hmmm/articles.js'
import ArticlesAdd from '../components/articles-add'
import ArticlePreview from '../components/articles-preview'
export default {
  name: 'Articles',
  created() {
    this.getArticles()
  },
  components: {
    'articles-add': ArticlesAdd,
    'articles-preview': ArticlePreview
  },
  data() {
    return {
      counts: 0,
      queryInfo: {
        page: 1,
        pagesize: 10,
        keyword: '',
        state: ''
      },
      articles: [],
      videoURL: null,
      currentArticleId: null,
      previewShow: false,
      addShow: false,
      stateList: status
    }
  },
  methods: {
    async getArticles() {
      const formCopy = {}
      for (const key in this.queryInfo) {
        if (this.queryInfo[key] !== '') {
          formCopy[key] = this.queryInfo[key]
        }
      }
      try {
        const { data: res } = await articleList(formCopy)
        console.log(res)
        this.counts = res.counts
        this.articles = res.items
      } catch (err) {
        console.log(err)
        this.$message.error('获取文章列表失败')
      }
    },
    previewArticle(id) {
      this.currentArticleId = id
      this.previewShow = true
    },
    addArticle() {
      this.currentArticleId = null
      this.addShow = true
    },
    changeArticleState(id, state) {
      this.$confirm('是否' + (state ? '禁用' : '启用') + '该文章', '提示', {
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
          await this.getArticles()
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
    editArticle(id) {
      this.currentArticleId = id
      this.addShow = true
    },
    deleteArticle(id) {
      this.$confirm('此操作将永久删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await removeArticle({ id: id })
          } catch (err) {
            console.log(err)
            this.$message.error('删除失败')
          }
          if (this.articles.length === 1) {
            if (this.queryInfo.page > 1) {
              this.queryInfo.page--
            }
          }
          await this.getArticles()
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
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.queryInfo.page = 1
      this.getArticles()
    },
    handleCurrentChange(val) {
      this.queryInfo.page = val
      this.getArticles()
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
  .mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    .center-align {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      .close-video-btn {
        width: 50px;
        height: 50px;
        line-height: 46px;
        padding-bottom: 4px;
        margin-bottom: 40px;
        text-align: center;
        font-size: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        border-radius: 50%;
        box-shadow: 0px 0px 4px 2px #999;
      }
      .qun-player {
        max-width: 800px;
        max-height: 600px;
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
