<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col :span="3">
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 树形结构表格区 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text="#"
        :expand-type="false"
        :selection-type="false"
        border
      >
        <template slot="isok" scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="level" scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            type="success"
            >二级</el-tag
          >
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <template slot="operate" scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row)"
          ></el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
          ></el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[6, 10, 16, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialog" width="50%">
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="closeAddCateDialog('addCateRef')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialog" width="50%">
      <el-form
        ref="editCateRef"
        :model="editCateForm"
        :rules="editCateRules"
        label-width="80px"
      >
        <el-form-item label="分类名称:">
          <el-input v-model="editCateForm.cat_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="editCate('editCateRef')"
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
      // 请求参数
      queryInfo: {
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 6
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table 指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'level'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'operate'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialog: false,
      // 添加分类表单的数据
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类级别
        cat_level: 0,
        // 父级分类
        cat_pid: 0
      },
      // 添加分类表单的验证规则对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 前两层商品分类列表
      parentCateList: [],
      // 保存选中的分类
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 控制修改分类对话框的显示与隐藏
      editCateDialog: false,
      // 编辑表单的数据
      editCateForm: {
        cat_id: '',
        cat_name: ''
      },
      //
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听分页数据条数的改变
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getCateList()
    },
    // 监听页码改变
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCateList()
    },
    // 获取两层商品分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },
    // 展示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialog = true
    },
    // 监听级联选择器选择的分类
    handleChange() {
      if (this.selectedKeys.length === 1) {
        this.addCateForm.cat_pid = this.selectedKeys[0]
        this.addCateForm.cat_level = 1
      } else if (this.selectedKeys.length === 2) {
        this.addCateForm.cat_pid = this.selectedKeys[1]
        this.addCateForm.cat_level = 2
      }
    },
    // 提交添加分类的请求
    closeAddCateDialog(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addCateDialog = false
        this.getCateList()
        this.getParentCateList()
        this.$message.success(res.meta.msg)
      })
    },
    // 展示修改分类对话框
    showEditCateDialog(currentCate) {
      this.editCateForm.cat_id = currentCate.cat_id
      this.editCateForm.cat_name = currentCate.cat_name
      this.editCateDialog = true
    },
    // 向服务器提交修改分类信息
    editCate(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editCateDialog = false
        this.getCateList()
        this.$message.success(res.meta.msg)
      })
    },
    // 删除指定分类
    async removeCateById(cateId) {
      const currentState = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      if (currentState !== 'confirm') return
      const { data: res } = await this.$http.delete(`categories/${cateId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getCateList()
      this.$message.success(res.meta.msg)
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 20px 0;
}
.el-cascader {
  height: 60px;
}
</style>
