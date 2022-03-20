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
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
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
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditGoods(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[6, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改商品信息对话框 -->
    <el-dialog title="修改商品信息" :visible.sync="editGoodsDialog" width="50%">
      <!-- 修改信息的表单 -->
      <el-form
        :model="editGoodsForm"
        :rules="editGoodsRules"
        ref="editGoodsRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editGoodsForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodsForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialog = false">取 消</el-button>
        <el-button type="primary" @click="editGoods('editGoodsRef')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
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
      total: 0,
      // 控制显示修改商品信息的对话框
      editGoodsDialog: false,
      // 修改商品的信息
      editGoodsForm: {},
      // 表单验证对象
      editGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 添加商品按钮
    addGoods() {
      this.$router.push('/addGoods')
    },
    // 每页显示条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页码的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 处理删除操作
    async removeGoodsById(goods) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // 点击取消，撤销删除
      if (confirmResult !== 'confirm') return
      // 点击确定，执行删除
      const { data: res } = await this.$http.delete(`goods/${goods.goods_id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    // 展示商品信息
    async showEditGoods(goods) {
      const { data: res } = await this.$http.get(`goods/${goods.goods_id}`)
      if (res.meta.status !== 200) {
        this.$message.error('获取商品信息失败')
      }
      console.log(res)
      this.editGoodsForm = res.data
      this.editGoodsDialog = true
    },
    // 修改商品信息
    editGoods(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `goods/${this.editGoodsForm.goods_id}`,
          this.editGoodsForm
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改商品信息失败')
        }
        this.editGoodsDialog = false
        this.$message.success('成功修改商品信息')
        this.getGoodsList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  font-size: 14px;
}
</style>
