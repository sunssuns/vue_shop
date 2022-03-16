<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 顶部提示 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning">
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col :span="4">
          <span>选择商品分类:</span>
        </el-col>
        <el-col :span="6">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            size="mini"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页切换 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数 面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isSelectedTheThird"
            @click="addParamsDialog = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 展开列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParamsById(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数 面板-->
        <el-tab-pane label="静态参数" name="only">
          <el-button
            type="primary"
            :disabled="isSelectedTheThird"
            @click="addParamsDialog = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 展开列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParamsById(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialog"
      width="50%"
      @close="closedAddDialog('addParamsRef')"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="addParams('addParamsRef')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 编辑参数/属性对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsDialog"
      width="50%"
      @close="closedEditDialog('editParamsRef')"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input
            v-model="editParamsForm.attr_name"
          ></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialog = false">取 消</el-button>
        <el-button type="primary" @click="editParams('editParamsRef')"
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
      // 级联选择器选中的选项id
      selectedKeys: [],
      // 商品分类列表数据
      cateList: [],
      // 级联选择器选项的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 标签页控制切换的参数
      activeName: 'many',
      // 选中第三级分类后才能使用按钮
      isSelectedTheThird: true,
      // 动态参数
      manyParamsData: [],
      // 动态参数
      onlyParamsData: [],
      // 控制显示添加参数对话框
      addParamsDialog: false,
      // 添加参数数据
      addParamsForm: {
        // 参数名称
        attr_name: ''
      },
      // 添加表单的校验对象
      addParamsRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      // 控制显示修改对话框
      editParamsDialog: false,
      // 修改的数据
      editParamsForm: {
        // 参数名称
        attr_name: '',
        attr_id: ''
      },
      // 修改表单的校验对象
      editParamsRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.cateList = res.data
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) return (this.selectedKeys = [])
      this.isSelectedTheThird = false
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      if (this.activeName === 'many') {
        this.manyParamsData = res.data
      } else if (this.activeName === 'only') {
        this.onlyParamsData = res.data
      }
    },
    // 监听级联选择器选项改变的处理函数
    handleChange() {
      // 获取参数列表
      this.getParamsData()
    },
    // 监听标签页切换的处理函数
    handleClick() {
      // 获取参数列表
      this.getParamsData()
    },
    // 监听对话框关闭处理函数
    closedAddDialog(formName) {
      this.$refs[formName].resetFields()
    },
    // 添加参数
    addParams(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error(this.titleText + '添加失败')
        }
        this.getParamsData()
      })
      this.addParamsDialog = false
    },
    // 显示编辑对话框，获取需要编辑的信息
    showEditDialog(params) {
      console.log(params)
      this.editParamsDialog = true
      this.editParamsForm.attr_id = params.attr_id
      this.editParamsForm.attr_name = params.attr_name
      console.log(this.editParamsForm)
    },
    // 监听对话框关闭处理函数
    closedEditDialog(formName) {
      this.$refs[formName].resetFields()
    },
    // 提交修改请求
    editParams(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editParamsDialog = false
        this.$message.success(res.meta.msg)
        this.getParamsData()
      })
    },
    // 删除参数
    async removeParamsById(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getParamsData()
    }
  },
  computed: {
    cateId() {
      return this.selectedKeys[2]
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 20px;
}
</style>
