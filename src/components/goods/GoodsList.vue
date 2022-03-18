<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="24">
        <!-- 搜索框 -->
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @blur="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="5">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表table -->
      <el-table border stripe :data="goodsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="110px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="100px"
        ></el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | timeFilter }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        // 查询关键词，可以为空
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 6
      },
      // 保存商品列表数据
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    addGoods() {
      this.$router.push('/addGoods')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 14px;
}
</style>
